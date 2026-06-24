import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleType } from "@/types/billing";
import type { AppRole } from "@/components/ayura/RoleBadge";
import { appRoleToRoleType } from "@/services/auth-service";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

interface SessionStore {
  activeRole: RoleType | null;
  unlockedAt: number | null;
  activePharmacistId: string | null;
  unlock: (role: AppRole) => void;
  lock: () => void;
  setActivePharmacist: (id: string | null) => void;
  isUnlocked: () => boolean;
  autoLockIfExpired: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      activeRole: null,
      unlockedAt: null,
      activePharmacistId: null,

      unlock: (role) =>
        set({
          activeRole: appRoleToRoleType(role),
          unlockedAt: Date.now(),
        }),

      lock: () =>
        set({
          activeRole: null,
          unlockedAt: null,
        }),

      setActivePharmacist: (id) => set({ activePharmacistId: id }),

      isUnlocked: () => {
        const { activeRole, unlockedAt } = get();
        if (!activeRole || !unlockedAt) return false;
        return Date.now() - unlockedAt < SESSION_TIMEOUT_MS;
      },

      autoLockIfExpired: () => {
        if (!get().isUnlocked()) {
          set({ activeRole: null, unlockedAt: null });
        }
      },
    }),
    { name: "ayura-session" },
  ),
);

export function useActiveAppRole(): AppRole | null {
  const role = useSessionStore((s) => s.activeRole);
  if (!role) return null;
  if (role === "FRONT_DESK") return "front-desk";
  if (role === "DOCTOR") return "doctor";
  return "admin";
}
