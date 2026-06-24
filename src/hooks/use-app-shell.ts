import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useActiveAppRole, useSessionStore } from "@/stores/session-store";
import { useSyncStore } from "@/stores/sync-store";
import { useClinicStore } from "@/stores/clinic-store";
import { formatTime } from "@/lib/utils";

export function useAppShell(title: string, subtitle?: string) {
  const navigate = useNavigate();
  const currentRole = useActiveAppRole();
  const lock = useSessionStore((s) => s.lock);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const syncing = useSyncStore((s) => s.syncing);
  const triggerSync = useSyncStore((s) => s.triggerSync);
  const clinicName = useClinicStore((s) => s.settings?.clinicName);

  return {
    title,
    subtitle: subtitle ?? clinicName,
    currentRole,
    pendingSync: pendingCount,
    lastSync: lastSyncAt ? formatTime(new Date(lastSyncAt)) : undefined,
    onSync: async () => {
      if (syncing) return;
      const synced = await triggerSync();
      toast.success(synced > 0 ? `Synced ${synced} item(s)` : "Already up to date");
    },
    onLock: () => {
      lock();
      navigate("/access");
    },
  };
}
