import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingDraft } from "@/types/billing";

const INITIAL_DRAFT: OnboardingDraft = {
  clinicName: "ayurA Wellness Centre",
  address: "18th Main Road, Anna Nagar, Chennai",
  phone: "+91 9876543210",
  deviceKey: "",
  adminPassword: "",
  frontDeskPin: "",
  doctorName: "Dr. Veda Gayathri S",
  doctorPin: "",
  pharmacistName: "",
  slotDuration: "30",
  stockThreshold: "10",
  expiryWindow: "30",
};

interface OnboardingStore {
  step: number;
  draft: OnboardingDraft;
  setStep: (step: number) => void;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 0,
      draft: INITIAL_DRAFT,
      setStep: (step) => set({ step }),
      updateDraft: (patch) =>
        set((state) => ({ draft: { ...state.draft, ...patch } })),
      reset: () => set({ step: 0, draft: INITIAL_DRAFT }),
    }),
    { name: "ayura-onboarding" },
  ),
);
