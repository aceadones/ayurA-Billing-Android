import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/db/database";
import { calculateTotals } from "@/lib/totals-calculator";
import { newId } from "@/lib/id";
import { useAppShell } from "@/hooks/use-app-shell";
import { formatCurrency } from "@/lib/utils";
import type { BillItemInput, BillItemType } from "@/types/billing";
import {
  Plus,
  FileText,
  IndianRupee,
  UserRound,
  Pill,
  Stethoscope,
  MessageCircle,
  Info,
} from "lucide-react";

export function EstimationScreen() {
  const shell = useAppShell("Estimation", "Non-binding cost estimate");
  const medicines = useLiveQuery(() => db.medicines.toArray(), []);
  const treatments = useLiveQuery(() => db.treatments.filter((t) => t.active).toArray(), []);

  const [patientName, setPatientName] = useState("");
  const [items, setItems] = useState<BillItemInput[]>([]);

  const totals = useMemo(() => calculateTotals(items, 0), [items]);
  const hasConsultation = items.some((i) => i.type === "CONSULTATION");

  function addFromCatalog(type: BillItemType, id: string) {
    if (type === "CONSULTATION" && hasConsultation) return;

    if (type === "MEDICINE") {
      const med = medicines?.find((m) => m.id === id);
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
    } else if (type === "TREATMENT") {
      const tr = treatments?.find((t) => t.id === id);
      if (!tr) return;
      setItems((prev) => [
        ...prev,
        {
          id: tr.id,
          type: "TREATMENT",
          title: tr.name,
          qty: 1,
          unitPrice: tr.fee,
          taxPercent: 5,
          discount: 0,
        },
      ]);
    } else {
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
  }

  return (
    <AppShell {...shell}>
      <div className="screen-pad grid landscape:grid-cols-[1fr_300px] gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
            <Info className="size-4 text-sky-600 shrink-0" />
            <p className="text-xs text-sky-700">
              Estimates are for quoting only. No payment or stock changes are recorded.
            </p>
          </div>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ayura-green-light rounded-lg">
                  <UserRound className="size-4 text-ayura-green" />
                </div>
                <Input
                  placeholder="Patient / prospect name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Select onValueChange={(id) => addFromCatalog("MEDICINE", id)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Medicine" />
              </SelectTrigger>
              <SelectContent>
                {(medicines ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(id) => addFromCatalog("TREATMENT", id)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Treatment" />
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
              className="gap-1.5 text-xs h-8"
              onClick={() => addFromCatalog("CONSULTATION", "")}
            >
              <Plus className="size-3.5" />
              <MessageCircle className="size-3.5" />
              Consultation
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.type === "MEDICINE" && <Pill className="size-4 text-sky-600" />}
                    {item.type === "TREATMENT" && (
                      <Stethoscope className="size-4 text-ayura-green" />
                    )}
                    {item.type === "CONSULTATION" && (
                      <MessageCircle className="size-4 text-amber-600" />
                    )}
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(item.qty * item.unitPrice - (item.discount ?? 0))}
                  </span>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Add items to build the estimate.
              </p>
            )}
          </div>
        </div>

        <Card className="self-start sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="size-4 text-ayura-green" />
              Estimate Total
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(totals.taxTotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total Estimate</span>
              <span className="text-ayura-green">{formatCurrency(totals.grandTotal)}</span>
            </div>
            <Button className="w-full gradient-ayura text-white border-0 h-10" disabled>
              <FileText className="size-4 mr-2" />
              Save Estimate
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
