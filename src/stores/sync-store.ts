import { create } from "zustand";
import { getLastSyncTime, getPendingSyncCount } from "@/db/database";
import { syncBatch } from "@/services/sync-engine";

interface SyncStore {
  pendingCount: number;
  lastSyncAt: number | null;
  syncing: boolean;
  refresh: () => Promise<void>;
  triggerSync: () => Promise<number>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  pendingCount: 0,
  lastSyncAt: null,
  syncing: false,

  refresh: async () => {
    const [pendingCount, lastSyncAt] = await Promise.all([
      getPendingSyncCount(),
      getLastSyncTime(),
    ]);
    set({ pendingCount, lastSyncAt });
  },

  triggerSync: async () => {
    if (get().syncing) return 0;
    set({ syncing: true });
    try {
      const synced = await syncBatch();
      await get().refresh();
      return synced;
    } finally {
      set({ syncing: false });
    }
  },
}));
