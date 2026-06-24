import { useEffect } from "react";
import { useClinicStore } from "@/stores/clinic-store";
import { useSyncStore } from "@/stores/sync-store";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const loadClinic = useClinicStore((s) => s.load);
  const refreshSync = useSyncStore((s) => s.refresh);

  useEffect(() => {
    void loadClinic();
    void refreshSync();
    const interval = setInterval(() => {
      void refreshSync();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadClinic, refreshSync]);

  return <>{children}</>;
}
