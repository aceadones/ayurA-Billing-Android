import { create } from "zustand";
import { getSettings } from "@/db/database";
import type { ClinicSettings } from "@/types/billing";

interface ClinicStore {
  settings: ClinicSettings | null;
  loading: boolean;
  load: () => Promise<void>;
}

export const useClinicStore = create<ClinicStore>((set) => ({
  settings: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    const settings = await getSettings();
    set({ settings: settings ?? null, loading: false });
  },
}));
