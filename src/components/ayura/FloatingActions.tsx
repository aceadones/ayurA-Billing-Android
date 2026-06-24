import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  X,
  Phone,
  QrCode,
  Copy,
  Check,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useClinicStore } from "@/stores/clinic-store";

// ─── Payment QR Dialog ────────────────────────────────────────────────────────
function PaymentQRDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const settings = useClinicStore((s) => s.settings);
  const qrUri = settings?.paymentQrUri;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#1C1917]">
        <DialogTitle className="sr-only">Payment QR Code</DialogTitle>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-50 size-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <XCircle className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-5 px-8 py-10">
          <p className="text-white/60 text-xs uppercase tracking-widest font-medium">
            {settings?.clinicName ?? "Clinic"}
          </p>
          <p className="text-white font-display text-2xl font-semibold">
            Payment QR
          </p>

          {qrUri ? (
            <div className="rounded-2xl bg-white p-4 shadow-2xl">
              <img
                src={qrUri}
                alt="Payment QR code"
                className="size-64 object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <QrCode className="size-16 text-white/20" />
              <p className="text-white/50 text-sm text-center max-w-xs">
                No payment QR configured. Ask the admin to add one in Admin
                settings.
              </p>
            </div>
          )}

          <p className="text-white/40 text-xs text-center">
            Scan with any UPI app · Google Pay · PhonePe · Paytm
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Call Doctor Dialog ───────────────────────────────────────────────────────
function CallDoctorDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const doctors = useLiveQuery(() => db.doctors.filter((d) => d.active).toArray(), []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPhone(phone: string, id: string) {
    await navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.success("Number copied");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <Phone className="size-4 text-ayura-primary" />
          Call Doctor
        </DialogTitle>

        <div className="flex flex-col gap-2 pt-1">
          {!doctors?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active doctors found.
            </p>
          ) : (
            doctors.map((doc) => {
              const phone = (doc as { phone?: string }).phone;
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    {doc.specialization && (
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.specialization}
                      </p>
                    )}
                    {phone && (
                      <p className="text-xs text-ayura-primary font-mono">
                        {phone}
                      </p>
                    )}
                  </div>

                  {phone ? (
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 h-8 px-2.5"
                        asChild
                      >
                        <a href={`tel:${phone}`}>
                          <Phone className="size-3.5" />
                          Call
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0"
                        onClick={() => copyPhone(phone, doc.id)}
                      >
                        {copiedId === doc.id ? (
                          <Check className="size-3.5 text-ayura-primary" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground shrink-0">
                      No phone
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── FAB Action button ────────────────────────────────────────────────────────
interface FabActionProps {
  icon: typeof Phone;
  label: string;
  onClick: () => void;
  index: number;
  visible: boolean;
}

function FabAction({ icon: Icon, label, onClick, index, visible }: FabActionProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 transition-all duration-200",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
      style={{
        transitionDelay: visible ? `${index * 50}ms` : "0ms",
      }}
    >
      {/* Label */}
      <span className="bg-[#1C1917]/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap backdrop-blur-sm">
        {label}
      </span>
      {/* Icon button */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "size-11 rounded-full shadow-lg flex items-center justify-center",
          "bg-white border border-border text-ayura-green",
          "hover:bg-ayura-green hover:text-white hover:border-ayura-green",
          "transition-all duration-150 active:scale-95",
        )}
      >
        <Icon className="size-4.5" />
      </button>
    </div>
  );
}

// ─── Main FAB ─────────────────────────────────────────────────────────────────
export function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showCall, setShowCall] = useState(false);

  const actions = [
    {
      icon: Phone,
      label: "Call Doctor",
      onClick: () => {
        setOpen(false);
        setShowCall(true);
      },
    },
    {
      icon: QrCode,
      label: "Payment QR",
      onClick: () => {
        setOpen(false);
        setShowQR(true);
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB stack */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">
        {/* Action items — render reversed so first appears closest to FAB */}
        {[...actions].reverse().map((action, i) => (
          <FabAction
            key={action.label}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            index={actions.length - 1 - i}
            visible={open}
          />
        ))}

        {/* Main FAB button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "size-14 rounded-full shadow-xl flex items-center justify-center",
            "bg-ayura-green text-white hover:bg-ayura-green-dark",
            "transition-all duration-300 active:scale-95",
            open && "rotate-45",
          )}
          aria-label={open ? "Close actions" : "Quick actions"}
        >
          {open ? (
            <X className="size-6" />
          ) : (
            <Plus className="size-6" />
          )}
        </button>
      </div>

      {/* Dialogs */}
      <PaymentQRDialog open={showQR} onClose={() => setShowQR(false)} />
      <CallDoctorDialog open={showCall} onClose={() => setShowCall(false)} />
    </>
  );
}
