/**
 * ayurA Billing — WhatsApp Bridge Server
 *
 * Standalone Node.js sidecar that connects to WhatsApp via Baileys and
 * exposes a REST + SSE API for the React billing app.
 *
 * Start: node server/whatsapp.mjs   (from project root after `cd server && npm install`)
 * Port:  WA_PORT env var or 3001
 *
 * Endpoints:
 *   GET  /api/whatsapp/status        → { status, hasQR }
 *   GET  /api/whatsapp/qr-stream     → SSE: qr | connected | disconnected events
 *   POST /api/whatsapp/send          → { to, text }
 *   POST /api/whatsapp/send-invoice  → { to, text?, pdfBase64?, filename? }
 *   POST /api/whatsapp/logout        → disconnect & clear session
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import express from "express";
import cors from "cors";
import QRCode from "qrcode";
import pino from "pino";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = join(__dirname, "session");
const PORT = process.env.WA_PORT ? parseInt(process.env.WA_PORT, 10) : 3001;

// ─── State ───────────────────────────────────────────────────────────────────
let sock = null;
let currentQRDataURL = null;
let connectionStatus = "disconnected"; // 'disconnected' | 'connecting' | 'connected'
const sseClients = new Set();

// Silent pino logger — Baileys logs internally but we don't want noise
const logger = pino({ level: "silent" });

// ─── SSE helpers ─────────────────────────────────────────────────────────────
function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

// ─── Baileys bridge ──────────────────────────────────────────────────────────
async function startBridge() {
  await mkdir(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: true, // Also print to terminal as fallback
    browser: ["ayurA Billing", "Chrome", "1.0"],
    connectTimeoutMs: 60_000,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      try {
        currentQRDataURL = await QRCode.toDataURL(qr, {
          width: 320,
          margin: 2,
          color: { dark: "#1C1917", light: "#FAFAF7" },
        });
        connectionStatus = "connecting";
        broadcastSSE({ type: "qr", qr: currentQRDataURL });
        console.log("📱 Scan QR code in the ayurA Billing app → Messaging screen");
      } catch (e) {
        console.error("QR generation error:", e);
      }
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      currentQRDataURL = null;
      connectionStatus = "disconnected";
      broadcastSSE({ type: "disconnected", code: statusCode });

      if (shouldReconnect) {
        console.log(`Connection closed (${statusCode}). Reconnecting in 5s…`);
        setTimeout(startBridge, 5000);
      } else {
        console.log("Logged out. Scan QR to reconnect.");
        sock = null;
      }
    }

    if (connection === "open") {
      currentQRDataURL = null;
      connectionStatus = "connected";
      console.log("✅ WhatsApp connected!");
      broadcastSSE({ type: "connected" });
    }
  });
}

// ─── Normalize phone → WhatsApp JID ──────────────────────────────────────────
function toJid(phone) {
  const digits = phone.replace(/\D/g, "");
  // Ensure Indian numbers have country code 91 if 10 digits
  if (digits.length === 10) return `91${digits}@s.whatsapp.net`;
  return `${digits}@s.whatsapp.net`;
}

// ─── Express app ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100mb" }));

// Status endpoint
app.get("/api/whatsapp/status", (_req, res) => {
  res.json({ status: connectionStatus, hasQR: !!currentQRDataURL });
});

// SSE: real-time QR + connection updates
app.get("/api/whatsapp/qr-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering if behind proxy
  res.flushHeaders();

  sseClients.add(res);

  // Immediately send current state to the new subscriber
  if (currentQRDataURL && connectionStatus !== "connected") {
    res.write(`data: ${JSON.stringify({ type: "qr", qr: currentQRDataURL })}\n\n`);
  } else if (connectionStatus === "connected") {
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({ type: "disconnected" })}\n\n`);
  }

  req.on("close", () => sseClients.delete(res));
});

// Send plain text message
app.post("/api/whatsapp/send", async (req, res) => {
  if (connectionStatus !== "connected" || !sock) {
    return res.status(503).json({ error: "WhatsApp not connected. Scan QR first." });
  }
  const { to, text } = req.body;
  if (!to || !text) return res.status(400).json({ error: "Missing 'to' or 'text'" });

  try {
    await sock.sendMessage(toJid(to), { text });
    res.json({ ok: true });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Send invoice (PDF document + caption text)
app.post("/api/whatsapp/send-invoice", async (req, res) => {
  if (connectionStatus !== "connected" || !sock) {
    return res.status(503).json({ error: "WhatsApp not connected. Scan QR first." });
  }
  const { to, text, pdfBase64, filename = "invoice.pdf" } = req.body;
  if (!to) return res.status(400).json({ error: "Missing 'to'" });

  try {
    const jid = toJid(to);
    if (pdfBase64) {
      const buffer = Buffer.from(pdfBase64, "base64");
      await sock.sendMessage(jid, {
        document: buffer,
        mimetype: "application/pdf",
        fileName: filename,
        caption: text ?? "",
      });
    } else if (text) {
      await sock.sendMessage(jid, { text });
    } else {
      return res.status(400).json({ error: "Provide 'text' or 'pdfBase64'" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Send invoice error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Logout / disconnect
app.post("/api/whatsapp/logout", async (_req, res) => {
  try {
    if (sock) await sock.logout();
  } catch {
    // Ignore logout errors
  }
  sock = null;
  currentQRDataURL = null;
  connectionStatus = "disconnected";
  broadcastSSE({ type: "disconnected" });
  res.json({ ok: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 ayurA WhatsApp Bridge → http://localhost:${PORT}`);
  console.log(`   Session: ${SESSION_DIR}\n`);
  startBridge().catch((err) => {
    console.error("Bridge start failed:", err);
    process.exit(1);
  });
});
