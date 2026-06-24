# WhatsApp Baileys Bridge (Archived)

This folder preserves the **Hermes/OpenClaw-style** WhatsApp integration using
`@whiskeysockets/baileys` + a Node.js sidecar (`server/whatsapp.mjs`).

The main app now uses **WhatsApp Business Cloud API** instead (no PC required).

## Restore (if needed)

1. Copy `server/` back to project root
2. Restore `src/services/whatsapp-api.ts` and `src/stores/whatsapp-store.ts`
3. Add vite proxy for `/api/whatsapp` → `localhost:3001`
4. Run `npm run whatsapp` on a clinic PC; point tablet bridge URL to that PC

## Files

- `server/` — Baileys bridge (port 3001)
- `whatsapp-api.ts` — client SSE/REST calls to bridge
- `whatsapp-store.ts` — Zustand bridge state
- `whatsapp-bridge.ts` — wa.me fallback opener
- `MessagingScreen.bridge.tsx` — QR scan UI for bridge login
