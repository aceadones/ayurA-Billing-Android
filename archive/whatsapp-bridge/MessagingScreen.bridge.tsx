import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { AppShell } from "@/components/layout/AppShell";
import { useAppShell } from "@/hooks/use-app-shell";
import {
  useWhatsAppStore,
  type WaStatus,
} from "@/stores/whatsapp-store";
import {
  fetchWaStatus,
  openWaQRStream,
  sendWaText,
  logoutWa,
} from "@/services/whatsapp-api";
import { useSessionStore } from "@/stores/session-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  Send,
  MessageCircle,
  Loader2,
  QrCode,
  Settings,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_META: Record<
  WaStatus,
  { label: string; color: string; icon: typeof Wifi }
> = {
  bridge_offline: {
    label: "Bridge Offline",
    color: "text-destructive bg-destructive/10",
    icon: AlertCircle,
  },
  disconnected: {
    label: "Disconnected",
    color: "text-muted-foreground bg-muted",
    icon: WifiOff,
  },
  connecting: {
    label: "Waiting for scan…",
    color: "text-ayura-accent bg-ayura-accent/10",
    icon: QrCode,
  },
  connected: {
    label: "Connected",
    color: "text-ayura-primary bg-ayura-primary/10",
    icon: Wifi,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function MessagingScreen() {
  const shell = useAppShell("Messaging", "WhatsApp channel");
  const activeRole = useSessionStore((s) => s.activeRole);
  const isAdmin = activeRole === "ADMIN";

  const { status, qr, bridgeUrl, setStatus, setQr, setBridgeUrl } =
    useWhatsAppStore();

  const [bridgeUrlDraft, setBridgeUrlDraft] = useState(bridgeUrl);
  const [editingUrl, setEditingUrl] = useState(false);

  // Send form
  const [sendTo, setSendTo] = useState("");
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);

  const closeSseRef = useRef<(() => void) | null>(null);

  // ─── Connect to bridge SSE ─────────────────────────────────────────────────
  function connectSSE() {
    closeSseRef.current?.();

    const close = openWaQRStream((event) => {
      if (event.type === "qr") {
        setStatus("connecting");
        setQr(event.qr ?? null);
      } else if (event.type === "connected") {
        setStatus("connected");
        setQr(null);
      } else if (event.type === "disconnected") {
        setStatus("disconnected");
        setQr(null);
      } else if (event.type === "bridge_offline") {
        setStatus("bridge_offline");
        setQr(null);
      }
    });

    closeSseRef.current = close;
  }

  useEffect(() => {
    // Initial status check then subscribe
    fetchWaStatus().then((s) => {
      setStatus(s.status as WaStatus);
    });
    connectSSE();
    return () => closeSseRef.current?.();
  }, [bridgeUrl]);

  // ─── Disconnect ────────────────────────────────────────────────────────────
  async function handleDisconnect() {
    await logoutWa();
    setStatus("disconnected");
    setQr(null);
    toast.info("WhatsApp disconnected");
    connectSSE();
  }

  // ─── Save bridge URL ───────────────────────────────────────────────────────
  function saveBridgeUrl() {
    setBridgeUrl(bridgeUrlDraft.trim() || "http://localhost:3001");
    setEditingUrl(false);
    toast.success("Bridge URL updated");
  }

  // ─── Send test message ─────────────────────────────────────────────────────
  async function handleSend() {
    if (!sendTo || !sendText) return;
    setSending(true);
    const result = await sendWaText(sendTo, sendText);
    setSending(false);
    if (result.ok) {
      toast.success("Message sent!");
      setSendText("");
    } else {
      toast.error(result.error ?? "Send failed");
    }
  }

  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const isNativeApp = Capacitor.isNativePlatform();

  return (
    <AppShell {...shell}>
      <div className="p-4 lg:p-6 max-w-2xl mx-auto flex flex-col gap-5">
        {/* ── Status card ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-ayura-primary" />
                <CardTitle className="text-lg">WhatsApp Status</CardTitle>
              </div>
              <Badge
                className={cn(
                  "gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border-0",
                  meta.color,
                )}
              >
                <StatusIcon className="size-3.5" />
                {meta.label}
              </Badge>
            </div>
            <CardDescription>
              {status === "bridge_offline" &&
                "Cannot reach the WhatsApp bridge server. Make sure it is running."}
              {status === "disconnected" &&
                "Not connected to WhatsApp. Scan the QR code when it appears below."}
              {status === "connecting" &&
                "Open WhatsApp on your phone → Settings → Linked Devices → Link a Device."}
              {status === "connected" &&
                "WhatsApp is connected. Invoices can now be sent as PDF documents."}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* QR code area */}
            {status === "connecting" && qr ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="rounded-2xl border-4 border-ayura-primary/20 p-3 bg-white shadow-lg">
                  <img
                    src={qr}
                    alt="WhatsApp QR code"
                    className="size-56 rounded-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Scan with your phone. The QR expires in ~60 seconds — it
                  refreshes automatically.
                </p>
              </div>
            ) : status === "disconnected" ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                  <Smartphone className="size-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  QR code will appear here when the bridge generates one.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectSSE}
                  className="gap-1.5"
                >
                  <RefreshCw className="size-3.5" />
                  Reconnect bridge
                </Button>
              </div>
            ) : status === "connected" ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-ayura-primary/5 border border-ayura-primary/20">
                <CheckCircle2 className="size-5 text-ayura-primary shrink-0" />
                <p className="text-sm text-ayura-primary font-medium">
                  Connected — ready to send invoices via WhatsApp
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <AlertCircle className="size-5 text-destructive shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-destructive">
                    WhatsApp bridge not reachable
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isNativeApp
                      ? "The bridge runs on a clinic PC, not inside the tablet app. Ask admin to set the bridge URL (e.g. http://192.168.1.x:3001) and keep that PC on."
                      : "Run npm run whatsapp in a terminal on the same machine, then refresh."}
                  </p>
                </div>
              </div>
            )}

            {/* Disconnect button — admin only */}
            {isAdmin && status === "connected" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="w-fit gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <LogOut className="size-3.5" />
                Disconnect WhatsApp
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── Send message (connected only) ────────────────────────────────── */}
        {status === "connected" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Send Message</CardTitle>
              <CardDescription>
                Send a quick text to any WhatsApp number.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wa-to">Phone number</Label>
                <Input
                  id="wa-to"
                  placeholder="+91 98765 43210"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wa-text">Message</Label>
                <Input
                  id="wa-text"
                  placeholder="Hello, your appointment is confirmed…"
                  value={sendText}
                  onChange={(e) => setSendText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={sending || !sendTo || !sendText}
                className="w-fit gap-1.5 bg-ayura-primary hover:bg-ayura-primary-dark"
              >
                {sending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Send
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Bridge settings (admin only) ──────────────────────────────────── */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Bridge Settings</CardTitle>
              </div>
              <CardDescription>
                Configure where the WhatsApp bridge server is running. Use the
                local network IP when the tablet connects over Wi-Fi.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {editingUrl ? (
                <div className="flex gap-2">
                  <Input
                    value={bridgeUrlDraft}
                    onChange={(e) => setBridgeUrlDraft(e.target.value)}
                    placeholder="http://192.168.1.x:3001"
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={saveBridgeUrl}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setBridgeUrlDraft(bridgeUrl);
                      setEditingUrl(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 text-muted-foreground">
                    {bridgeUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingUrl(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}

              <Separator />

              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Setup instructions
                </p>
                {isNativeApp ? (
                  <ol className="text-xs text-muted-foreground list-decimal list-inside flex flex-col gap-1.5">
                    <li>
                      On a clinic PC or laptop (same Wi‑Fi), open the billing app
                      folder and run{" "}
                      <code className="bg-muted px-1 rounded">npm run whatsapp</code>
                    </li>
                    <li>
                      Note that PC&apos;s IP address (e.g.{" "}
                      <code className="bg-muted px-1 rounded">192.168.1.5</code>
                      )
                    </li>
                    <li>
                      Set bridge URL above to{" "}
                      <code className="bg-muted px-1 rounded">
                        http://&lt;PC-IP&gt;:3001
                      </code>
                    </li>
                    <li>
                      Open Messaging on the tablet — scan the QR with WhatsApp
                    </li>
                    <li>
                      Session is saved on the PC — scan once; tablet stays connected
                      while the bridge is running
                    </li>
                  </ol>
                ) : (
                  <ol className="text-xs text-muted-foreground list-decimal list-inside flex flex-col gap-1.5">
                    <li>Open a terminal in the billing app folder</li>
                    <li>
                      Run{" "}
                      <code className="bg-muted px-1 rounded">npm run whatsapp</code>{" "}
                      (or <code className="bg-muted px-1 rounded">npm run dev:all</code>)
                    </li>
                    <li>A QR code will appear on this screen — scan with WhatsApp</li>
                    <li>Session is saved — you only need to scan once per device</li>
                  </ol>
                )}
                <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                  Without the bridge, &quot;Send via WhatsApp&quot; on invoices still
                  opens WhatsApp with a text summary (no PDF attachment).
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
