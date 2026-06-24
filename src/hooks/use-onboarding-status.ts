import { useClinicStore } from "@/stores/clinic-store";
import { isOnboardingComplete } from "@/db/database";
import { useLiveQuery } from "dexie-react-hooks";

/** Onboarding status: clinic store first (instant after setup), then live Dexie query. */
export function useOnboardingStatus(): boolean | undefined {
  const settings = useClinicStore((s) => s.settings);
  const liveComplete = useLiveQuery(() => isOnboardingComplete(), [], undefined);

  if (settings?.onboardingComplete && settings.deviceAuthorized) {
    return true;
  }

  if (liveComplete === true) return true;
  if (liveComplete === false) return false;

  // Live query still loading and no store data yet
  if (!settings) return undefined;

  return Boolean(settings.onboardingComplete && settings.deviceAuthorized);
}
