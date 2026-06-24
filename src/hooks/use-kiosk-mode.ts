import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useClinicStore } from "@/stores/clinic-store";

/**
 * When kiosk mode is enabled (Admin → Device):
 * - Android back button won't exit the app at root routes
 * - App resume brings user back if they somehow left
 */
export function useKioskMode() {
  const kioskEnabled = useClinicStore((s) => s.settings?.kioskModeEnabled);

  useEffect(() => {
    if (!kioskEnabled || !Capacitor.isNativePlatform()) return;

    const backListener = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      }
      // At root: swallow back — don't exit app
    });

    const stateListener = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive && window.location.pathname === "/") {
        window.location.href = "/dashboard";
      }
    });

    return () => {
      void backListener.then((h) => h.remove());
      void stateListener.then((h) => h.remove());
    };
  }, [kioskEnabled]);
}
