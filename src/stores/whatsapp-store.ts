import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WaStatus = "bridge_offline" | "disconnected" | "connecting" | "connected";

interface WhatsAppState {
  status: WaStatus;
  qr: string | null;
  bridgeUrl: string;
  setStatus: (s: WaStatus) => void;
  setQr: (qr: string | null) => void;
  setBridgeUrl: (url: string) => void;
}

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set) => ({
      status: "disconnected",
      qr: null,
      bridgeUrl: "http://localhost:3001",
      setStatus: (status) => set({ status }),
      setQr: (qr) => set({ qr }),
      setBridgeUrl: (url) => set({ bridgeUrl: url }),
    }),
    {
      name: "ayura-whatsapp",
      // Only persist bridgeUrl — status/qr are ephemeral
      partialize: (s) => ({ bridgeUrl: s.bridgeUrl }),
    },
  ),
);
