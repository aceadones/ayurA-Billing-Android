import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { useSessionStore } from "@/stores/session-store";
import type { AppRole } from "@/components/ayura/RoleBadge";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Loading…</p>
    </div>
  );
}

export function RootRedirect() {
  const onboardingDone = useOnboardingStatus();
  const unlocked = useSessionStore((s) => s.isUnlocked());

  if (onboardingDone === undefined) return <LoadingScreen />;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  if (!unlocked) return <Navigate to="/access" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function OnboardingOnly() {
  const onboardingDone = useOnboardingStatus();
  if (onboardingDone === undefined) return <LoadingScreen />;
  if (onboardingDone) return <Navigate to="/access" replace />;
  return <Outlet />;
}

export function AccessOnly() {
  const onboardingDone = useOnboardingStatus();
  const unlocked = useSessionStore((s) => s.isUnlocked());

  if (onboardingDone === undefined) return <LoadingScreen />;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  if (unlocked) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function RequireAuth({ roles }: { roles?: AppRole[] }) {
  const location = useLocation();
  const onboardingDone = useOnboardingStatus();
  const activeRole = useSessionStore((s) => s.activeRole);
  const unlocked = useSessionStore((s) => s.isUnlocked());
  const autoLock = useSessionStore((s) => s.autoLockIfExpired);
  const lock = useSessionStore((s) => s.lock);

  useEffect(() => {
    autoLock();
  }, [location.pathname, autoLock]);

  if (onboardingDone === undefined) return <LoadingScreen />;

  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  if (!unlocked || !activeRole) {
    return <Navigate to="/access" replace state={{ from: location }} />;
  }

  if (roles?.length) {
    const roleMap = {
      "front-desk": "FRONT_DESK",
      doctor: "DOCTOR",
      admin: "ADMIN",
    } as const;
    const allowed = roles.some((r) => roleMap[r] === activeRole);
    if (!allowed) return <Navigate to="/dashboard" replace />;
  }

  return <Outlet context={{ lock }} />;
}
