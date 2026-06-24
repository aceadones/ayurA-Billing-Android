import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatCurrency } from "@/lib/utils";
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

type LineItemType = "medicine" | "treatment" | "consultation";

interface LineItem {
  id: string;
  type: LineItemType;
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

const TAX_RATE = 0.05;

function calcTotals(items: LineItem[], paid: number) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice * (1 - i.discount / 100), 0);
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;
  const balance = grandTotal - paid;
  return { subtotal, tax, grandTotal, balance };
}

const TYPE_CONFIG: Record<LineItemType, { icon: typeof Pill; label: string; color: string }> = {
  medicine: { icon: Pill, label: "Medicine", color: "bg-sky-50 text-sky-700 border-sky-200" },
  treatment: { icon: Stethoscope, label: "Treatment", color: "bg-ayura-green-light text-ayura-green border-green-200" },
  consultation: { icon: MessageCircle, label: "Consultation", color: "bg-ayura-gold-light text-amber-700 border-amber-200" },
};

export function InvoiceScreen() {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [paid, setPaid] = useState(0);

  const totals = calcTotals(items, paid);
  const hasConsultation = items.some((i) => i.type === "consultation");

  function addItem(type: LineItemType) {
    if (type === "consultation" && hasConsultation) return;
    const id = Math.random().toString(36).slice(2);
    const defaults: Record<LineItemType, Partial<LineItem>> = {
      medicine: { name: "Medicine", qty: 1, unitPrice: 50 },
      treatment: { name: "Treatment", qty: 1, unitPrice: 500 },
      consultation: { name: "Consultation", qty: 1, unitPrice: 300 },
    };
    setItems((prev) => [...prev, { id, type, discount: 0, ...defaults[type] } as LineItem]);
  }

  function updateItem(id: string, key: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <AppShell title="New Invoice" currentRole="front-desk" onLock={() => {}}>
      <div className="screen-pad grid landscape:grid-cols-[1fr_320px] gap-5 h-full">
        {/* ── Left: Patient + Line Items ── */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Patient info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserRound className="size-4 text-ayura-green" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 pt-0">
              <div className="flex-1">
                <Label htmlFor="pname" className="text-xs">Name</Label>
                <Input
                  id="pname"
                  placeholder="Patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
              <div className="w-36">
                <Label htmlFor="pphone" className="text-xs">Phone</Label>
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

          {/* Add item buttons */}
          <div className="flex gap-2">
            {(["medicine", "treatment", "consultation"] as LineItemType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const Icon = cfg.icon;
              const disabled = type === "consultation" && hasConsultation;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => addItem(type)}
                  className={cn("gap-1.5 text-xs h-8", !disabled && "hover:bg-muted")}
                >
                  <Plus className="size-3.5" />
                  <Icon className="size-3.5" />
                  {cfg.label}
                </Button>
              );
            })}
          </div>

          {/* Line items */}
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
                const lineTotal = item.qty * item.unitPrice * (1 - item.discount / 100);

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className={cn("h-1", item.type === "medicine" ? "bg-sky-400" : item.type === "treatment" ? "bg-ayura-green" : "bg-ayura-gold")} />
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-1.5 rounded-lg shrink-0 border", cfg.color)}>
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                          <div className="col-span-2">
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, "name", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Qty</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Price (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Discount (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, "discount", Number(e.target.value))}
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          <div className="flex items-end">
                            <span className="text-sm font-semibold">{formatCurrency(lineTotal)}</span>
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

        {/* ── Right: Totals + Actions ── */}
        <div className="flex flex-col gap-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <IndianRupee className="size-4 text-ayura-green" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              {/* Totals */}
              <div className="flex flex-col gap-2 text-sm">
                {[
                  ["Subtotal", totals.subtotal],
                  ["GST (5%)", totals.tax],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between text-muted-foreground">
                    <span>{label}</span>
                    <span>{formatCurrency(val as number)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>Grand Total</span>
                  <span className="text-ayura-green">{formatCurrency(totals.grandTotal)}</span>
                </div>

                <Separator />

                {/* Paid amount */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="paid" className="text-xs">Amount Paid (₹)</Label>
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

                <div className={cn(
                  "flex justify-between font-semibold text-sm px-3 py-2 rounded-lg",
                  totals.balance <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                )}>
                  <span>{totals.balance <= 0 ? "Paid in full" : "Balance Due"}</span>
                  <span>{totals.balance <= 0 ? "✓" : formatCurrency(Math.abs(totals.balance))}</span>
                </div>
              </div>

              <Separator />

              {/* Validation */}
              {!patientName && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <AlertCircle className="size-3.5" />
                  Patient name required
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full gradient-ayura text-white border-0 shadow-sm h-11"
                  disabled={!patientName || items.length === 0}
                >
                  <FileText className="size-4 mr-2" />
                  Save & Generate PDF
                </Button>
                <Button variant="outline" className="w-full h-9 gap-2 text-sm">
                  <Share2 className="size-4" />
                  Send via WhatsApp
                </Button>
                <Button variant="ghost" className="w-full h-9 text-muted-foreground text-sm">
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
