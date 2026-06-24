import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/db/database";
import { calculateTotals } from "@/lib/totals-calculator";
import { newId, newInvoiceId } from "@/lib/id";
import { cn, formatCurrency } from "@/lib/utils";
import { useAppShell } from "@/hooks/use-app-shell";
import { useSessionStore } from "@/stores/session-store";
import { saveInvoice } from "@/services/invoice-repository";
import { generateInvoicePdf, downloadPdfBlobUrl } from "@/services/pdf-generator";
import { sendInvoiceViaWhatsAppCloud } from "@/services/whatsapp-cloud-service";
import { useClinicStore } from "@/stores/clinic-store";
import { useSyncStore } from "@/stores/sync-store";
import type { BillItemInput, BillItemType, InvoiceDraft } from "@/types/billing";
import {
  UserRound,
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  MessageCircle,
  IndianRupee,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const TYPE_CONFIG: Record<
  BillItemType,
  { icon: typeof Pill; label: string; color: string }
> = {
  MEDICINE: {
    icon: Pill,
    label: "Medicine",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  TREATMENT: {
    icon: Stethoscope,
    label: "Treatment",
    color: "bg-ayura-green-light text-ayura-green border-green-200",
  },
  CONSULTATION: {
    icon: MessageCircle,
    label: "Consultation",
    color: "bg-ayura-gold-light text-amber-700 border-amber-200",
  },
};

export function InvoiceScreen() {
  const shell = useAppShell("New Invoice");
  const refreshSync = useSyncStore((s) => s.refresh);
  const pharmacistId = useSessionStore((s) => s.activePharmacistId) ?? "default";

  const medicines = useLiveQuery(() => db.medicines.toArray(), []);
  const treatments = useLiveQuery(() => db.treatments.filter((t) => t.active).toArray(), []);

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [items, setItems] = useState<BillItemInput[]>([]);
  const [paid, setPaid] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastPdfUrl, setLastPdfUrl] = useState<string | null>(null);

  const totals = useMemo(() => {
    try {
      return calculateTotals(items, paid);
    } catch {
      return calculateTotals([], paid);
    }
  }, [items, paid]);

  const hasConsultation = items.some((i) => i.type === "CONSULTATION");

  function addMedicine(medicineId: string) {
    const med = medicines?.find((m) => m.id === medicineId);
    if (!med) return;
    setItems((prev) => [
      ...prev,
      {
        id: med.id,
        type: "MEDICINE",
        title: med.name,
        qty: 1,
        unitPrice: med.unitPrice,
        taxPercent: med.taxPercent,
        discount: 0,
      },
    ]);
  }

  function addTreatment(treatmentId: string) {
    const treatment = treatments?.find((t) => t.id === treatmentId);
    if (!treatment) return;
    setItems((prev) => [
      ...prev,
      {
        id: treatment.id,
        type: "TREATMENT",
        title: treatment.name,
        qty: 1,
        unitPrice: treatment.fee,
        taxPercent: 5,
        discount: 0,
      },
    ]);
  }

  function addConsultation() {
    if (hasConsultation) return;
    setItems((prev) => [
      ...prev,
      {
        id: newId("cons"),
        type: "CONSULTATION",
        title: "Consultation",
        qty: 1,
        unitPrice: 500,
        taxPercent: 5,
        discount: 0,
      },
    ]);
  }

  function updateItem(id: string, key: keyof BillItemInput, value: string | number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function resetForm() {
    setPatientName("");
    setPatientPhone("");
    setItems([]);
    setPaid(0);
    setLastPdfUrl(null);
  }

  async function buildDraft(): Promise<InvoiceDraft> {
    return {
      invoiceId: newInvoiceId(),
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || undefined,
      pharmacistId,
      items,
      payments:
        paid > 0
          ? [{ method: "CASH", amount: paid }]
          : [],
      totals,
      createdAt: Date.now(),
    };
  }

  async function handleSave() {
    if (!patientName.trim() || items.length === 0) return;
    setSaving(true);
    try {
      const draft = await buildDraft();
      await saveInvoice(draft);
      const pdfUrl = await generateInvoicePdf(draft);
      setLastPdfUrl(pdfUrl);
      await refreshSync();
      toast.success(`Invoice ${draft.invoiceId} saved`);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndPdf() {
    if (!patientName.trim() || items.length === 0) return;
    setSaving(true);
    try {
      const draft = await buildDraft();
      await saveInvoice(draft);
      const pdfUrl = await generateInvoicePdf(draft);
      setLastPdfUrl(pdfUrl);
      downloadPdfBlobUrl(pdfUrl, `invoice_${draft.patientName.replace(/\s+/g, "_")}.pdf`);
      await refreshSync();
      toast.success(`Invoice ${draft.invoiceId} saved & PDF downloaded`);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  }

  const clinicSettings = useClinicStore((s) => s.settings);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  async function handleWhatsApp() {
    if (!patientPhone.trim()) {
      toast.error("Patient phone required for WhatsApp");
      return;
    }
    setSendingWhatsApp(true);
    try {
      const draft = await buildDraft();
      const pdfBlobUrl = lastPdfUrl ?? (await generateInvoicePdf(draft));
      const response = await fetch(pdfBlobUrl);
      const pdfBlob = await response.blob();
      const result = await sendInvoiceViaWhatsAppCloud(
        patientPhone,
        patientName,
        draft,
        pdfBlob,
        clinicSettings?.clinicName ?? "Clinic",
        clinicSettings,
      );
      if (result.ok) toast.success("Invoice sent to patient on WhatsApp");
      else toast.error(result.error ?? "WhatsApp send failed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "WhatsApp failed");
    } finally {
      setSendingWhatsApp(false);
    }
  }

  return (
    <AppShell {...shell}>
      <div className="screen-pad grid landscape:grid-cols-[1fr_320px] gap-5 h-full">
        <div className="flex flex-col gap-4 min-w-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserRound className="size-4 text-ayura-green" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 pt-0">
              <div className="flex-1">
                <Label htmlFor="pname" className="text-xs">
                  Name
                </Label>
                <Input
                  id="pname"
                  placeholder="Patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
              <div className="w-36">
                <Label htmlFor="pphone" className="text-xs">
                  Phone
                </Label>
                <Input
                  id="pphone"
                  type="tel"
                  placeholder="98765 43210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Select onValueChange={addMedicine}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Add medicine" />
              </SelectTrigger>
              <SelectContent>
                {(medicines ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.stockQty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={addTreatment}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Add treatment" />
              </SelectTrigger>
              <SelectContent>
                {(treatments ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              disabled={hasConsultation}
              onClick={addConsultation}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="size-3.5" />
              <MessageCircle className="size-3.5" />
              Consultation
            </Button>
          </div>

          <ScrollArea className="flex-1 max-h-[360px] landscape:max-h-[460px]">
            <div className="flex flex-col gap-2 pr-1">
              {items.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="p-4 bg-muted rounded-2xl">
                    <FileText className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add medicines, treatments or consultation to begin.
                  </p>
                </div>
              )}

              {items.map((item) => {
                const cfg = TYPE_CONFIG[item.type];
                const Icon = cfg.icon;
                const discount = item.discount ?? 0;
                const lineTotal = item.qty * item.unitPrice - discount;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div
                      className={cn(
                        "h-1",
                        item.type === "MEDICINE"
                          ? "bg-sky-400"
                          : item.type === "TREATMENT"
                            ? "bg-ayura-green"
                            : "bg-ayura-gold",
                      )}
                    />
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-1.5 rounded-lg shrink-0 border", cfg.color)}>
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                          <div className="col-span-2">
                            <Input
                              value={item.title}
                              onChange={(e) => updateItem(item.id, "title", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Qty</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                updateItem(item.id, "qty", Number(e.target.value))
                              }
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Price (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(item.id, "unitPrice", Number(e.target.value))
                              }
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">
                              Discount (₹)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={discount}
                              onChange={(e) =>
                                updateItem(item.id, "discount", Number(e.target.value))
                              }
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          <div className="flex items-end">
                            <span className="text-sm font-semibold">
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <IndianRupee className="size-4 text-ayura-green" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>{formatCurrency(totals.discountTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>{formatCurrency(totals.taxTotal)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>Grand Total</span>
                  <span className="text-ayura-green">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>

                <Separator />

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="paid" className="text-xs">
                    Amount Paid (₹)
                  </Label>
                  <Input
                    id="paid"
                    type="number"
                    min="0"
                    value={paid || ""}
                    onChange={(e) => setPaid(Number(e.target.value))}
                    placeholder="0"
                    className="h-9"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setPaid(totals.grandTotal)}
                  >
                    <CheckCircle2 className="size-3.5 mr-1.5" />
                    Full Payment
                  </Button>
                </div>

                <div
                  className={cn(
                    "flex justify-between font-semibold text-sm px-3 py-2 rounded-lg",
                    totals.balance <= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  <span>{totals.balance <= 0 ? "Paid in full" : "Balance Due"}</span>
                  <span>
                    {totals.balance <= 0 ? "✓" : formatCurrency(totals.balance)}
                  </span>
                </div>
              </div>

              <Separator />

              {!patientName && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <AlertCircle className="size-3.5" />
                  Patient name required
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full gradient-ayura text-white border-0 shadow-sm h-11"
                  disabled={!patientName || items.length === 0 || saving}
                  onClick={() => void handleSaveAndPdf()}
                >
                  <FileText className="size-4 mr-2" />
                  Save & Generate PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-9 gap-2 text-sm"
                  disabled={!patientPhone || items.length === 0 || sendingWhatsApp}
                  onClick={() => void handleWhatsApp()}
                >
                  <Share2 className="size-4" />
                  {sendingWhatsApp ? "Sending…" : "Send via WhatsApp"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-9 text-muted-foreground text-sm"
                  onClick={resetForm}
                >
                  Discard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
