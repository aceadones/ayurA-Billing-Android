/**
 * Client-side API calls to the ayurA WhatsApp bridge server.
 * The bridge URL is configurable from Admin settings (default: http://localhost:3001).
 * In dev, Vite proxies /api/whatsapp → localhost:3001.
 */

import { useWhatsAppStore } from "@/stores/whatsapp-store";

function bridgeUrl() {
  return useWhatsAppStore.getState().bridgeUrl;
}

export interface WaBridgeStatus {
  status: "bridge_offline" | "disconnected" | "connecting" | "connected";
  hasQR: boolean;
}

export async function fetchWaStatus(): Promise<WaBridgeStatus> {
  try {
    const res = await fetch(`${bridgeUrl()}/api/whatsapp/status`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("non-ok");
    return await res.json();
  } catch {
    return { status: "bridge_offline", hasQR: false };
  }
}

export function openWaQRStream(
  onEvent: (event: { type: string; qr?: string; code?: number }) => void,
): () => void {
  const url = `${bridgeUrl()}/api/whatsapp/qr-stream`;
  const es = new EventSource(url);

  es.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {
      // ignore parse errors
    }
  };

  es.onerror = () => {
    onEvent({ type: "bridge_offline" });
  };

  return () => es.close();
}

export async function sendWaText(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${bridgeUrl()}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, text }),
    });
    const data = await res.json();
    return res.ok ? { ok: true } : { ok: false, error: data.error };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Send an invoice via WhatsApp.
 * @param to   Phone number (any format — server normalises to Indian format)
 * @param text Caption / message
 * @param pdfBlob  PDF as a Blob (from jspdf) — converted to base64
 * @param filename File name shown in WhatsApp
 */
export async function sendWaInvoice(
  to: string,
  text: string,
  pdfBlob?: Blob,
  filename?: string,
): Promise<{ ok: boolean; error?: string }> {
  let pdfBase64: string | undefined;

  if (pdfBlob) {
    pdfBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data:application/pdf;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  }

  try {
    const res = await fetch(`${bridgeUrl()}/api/whatsapp/send-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, text, pdfBase64, filename }),
    });
    const data = await res.json();
    return res.ok ? { ok: true } : { ok: false, error: data.error };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function logoutWa(): Promise<void> {
  try {
    await fetch(`${bridgeUrl()}/api/whatsapp/logout`, { method: "POST" });
  } catch {
    // ignore
  }
}
