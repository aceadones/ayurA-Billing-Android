import { db } from "@/db/database";
import type { SyncQueueEntry } from "@/types/billing";
import { newId } from "@/lib/id";

const SYNC_STORAGE_KEY = "ayura_sync_log";

interface SyncLogEntry {
  taskId: string;
  entityType: string;
  entityId: string;
  operation: string;
  payload: unknown;
  syncedAt: number;
}

function appendSyncLog(entry: SyncLogEntry) {
  const existing = JSON.parse(localStorage.getItem(SYNC_STORAGE_KEY) ?? "[]") as SyncLogEntry[];
  existing.unshift(entry);
  localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
}

export async function syncBatch(limit = 25): Promise<number> {
  const pending = (await db.syncQueue
    .where("status")
    .anyOf(["PENDING", "FAILED"])
    .toArray())
    .sort((a, b) => b.priority - a.priority || a.updatedAt - b.updatedAt);

  const batch = pending.slice(0, limit);
  let synced = 0;

  for (const task of batch) {
    try {
      await simulateFirebaseSync(task);
      await db.syncQueue.update(task.id, {
        status: "SYNCED",
        lastError: undefined,
        updatedAt: Date.now(),
      });
      synced += 1;
    } catch (error) {
      await db.syncQueue.update(task.id, {
        status: "FAILED",
        retries: task.retries + 1,
        lastError: error instanceof Error ? error.message : "Sync failed",
        updatedAt: Date.now(),
      });
    }
  }

  return synced;
}

async function simulateFirebaseSync(task: SyncQueueEntry): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  appendSyncLog({
    taskId: task.id,
    entityType: task.entityType,
    entityId: task.entityId,
    operation: task.operation,
    payload: JSON.parse(task.payloadJson),
    syncedAt: Date.now(),
  });
}

export async function enqueueSync(
  entityType: string,
  entityId: string,
  operation: SyncQueueEntry["operation"],
  payload: Record<string, unknown>,
  priority = 10,
): Promise<void> {
  const now = Date.now();
  await db.syncQueue.put({
    id: newId("sync"),
    entityType,
    entityId,
    operation,
    payloadJson: JSON.stringify(payload),
    priority,
    status: "PENDING",
    retries: 0,
    updatedAt: now,
    createdAt: now,
  });
}
