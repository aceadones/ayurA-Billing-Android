import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/db/database";
import { useAppShell } from "@/hooks/use-app-shell";
import { useClinicStore } from "@/stores/clinic-store";
import {
  deleteMedicine,
  getStockStatus,
  importMedicineRows,
  parseMedicineCsv,
  upsertMedicine,
} from "@/services/stock-service";
import { cn, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  CalendarX,
  MoreVertical,
  ClipboardPaste,
  TrendingDown,
} from "lucide-react";

export function StockScreen() {
  const shell = useAppShell("Stock", "Medicine inventory");
  const expiryAlertDays = useClinicStore((s) => s.settings?.expiryAlertDays ?? 30);
  const medicines = useLiveQuery(() => db.medicines.toArray(), []);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [form, setForm] = useState({
    name: "",
    stockQty: "10",
    unitPrice: "100",
    minThreshold: "10",
    expiryDate: "",
  });

  const filtered = useMemo(
    () =>
      (medicines ?? []).filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [medicines, search],
  );

  const lowCount = (medicines ?? []).filter(
    (m) => getStockStatus(m, expiryAlertDays) === "low",
  ).length;
  const expiringCount = (medicines ?? []).filter(
    (m) => getStockStatus(m, expiryAlertDays) === "expiring",
  ).length;

  async function handleAddMedicine() {
    if (!form.name.trim()) return;
    await upsertMedicine({
      name: form.name.trim(),
      stockQty: Number(form.stockQty) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      taxPercent: 5,
      minThreshold: Number(form.minThreshold) || 10,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).getTime() : undefined,
    });
    toast.success("Medicine added");
    setDialogOpen(false);
    setForm({
      name: "",
      stockQty: "10",
      unitPrice: "100",
      minThreshold: "10",
      expiryDate: "",
    });
  }

  async function handlePasteImport() {
    try {
      const rows = parseMedicineCsv(pasteText);
      if (rows.length === 0) throw new Error("No valid rows found");
      const count = await importMedicineRows(rows);
      toast.success(`Imported ${count} medicines`);
      setPasteOpen(false);
      setPasteText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  }

  return (
    <AppShell {...shell}>
      <div className="screen-pad flex flex-col gap-4">
        {(lowCount > 0 || expiringCount > 0) && (
          <div className="flex gap-2 flex-wrap">
            {lowCount > 0 && (
              <Badge variant="outline" className="status-low-stock gap-1.5 text-xs">
                <TrendingDown className="size-3" />
                {lowCount} low stock
              </Badge>
            )}
            {expiringCount > 0 && (
              <Badge variant="outline" className="status-expiring gap-1.5 text-xs">
                <CalendarX className="size-3" />
                {expiringCount} expiring soon
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            size="sm"
            className="gradient-ayura text-white border-0 h-9 gap-1.5 shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 shrink-0"
            onClick={() => setPasteOpen(true)}
          >
            <ClipboardPaste className="size-4" />
            Paste CSV
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          {filtered.map((m) => {
            const status = getStockStatus(m, expiryAlertDays);
            return (
              <Card
                key={m.id}
                className={cn(
                  "transition-colors",
                  status === "low" && "border-orange-200 bg-orange-50/40",
                  status === "expiring" && "border-rose-200 bg-rose-50/40",
                )}
              >
                <CardContent className="py-3 px-4 flex items-center gap-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl shrink-0",
                      status === "ok" && "bg-ayura-green-light",
                      status === "low" && "bg-orange-100",
                      status === "expiring" && "bg-rose-100",
                    )}
                  >
                    <Package
                      className={cn(
                        "size-4",
                        status === "ok" && "text-ayura-green",
                        status === "low" && "text-orange-600",
                        status === "expiring" && "text-rose-600",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      {status === "low" && (
                        <Badge variant="outline" className="status-low-stock text-[10px] shrink-0">
                          Low
                        </Badge>
                      )}
                      {status === "expiring" && (
                        <Badge variant="outline" className="status-expiring text-[10px] shrink-0">
                          Expiring
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>
                        {m.stockQty} units · threshold {m.minThreshold}
                      </span>
                      {m.expiryDate && (
                        <span className={cn(status === "expiring" && "text-rose-600")}>
                          <CalendarX className="size-3 inline mr-0.5" />
                          {formatDate(new Date(m.expiryDate))}
                        </span>
                      )}
                    </div>
                  </div>

                  {status === "low" && (
                    <AlertTriangle className="size-4 text-orange-500 shrink-0" />
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="size-8 p-0 shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={async () => {
                          const qty = prompt("New quantity", String(m.stockQty));
                          if (qty == null) return;
                          await upsertMedicine({
                            ...m,
                            stockQty: Number(qty),
                          });
                          toast.success("Stock updated");
                        }}
                      >
                        Update quantity
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          await deleteMedicine(m.id);
                          toast.success("Medicine deleted");
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={form.stockQty}
                  onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit price</Label>
                <Input
                  type="number"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Threshold</Label>
                <Input
                  type="number"
                  value={form.minThreshold}
                  onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Expiry</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              className="gradient-ayura text-white border-0"
              onClick={() => void handleAddMedicine()}
            >
              Save medicine
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk paste (CSV)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Format: name, qty, threshold, expiryEpoch
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-input bg-background p-3 text-sm"
            placeholder="Ashwagandha Churna, 24, 10, 1789392000000"
          />
          <Button
            className="gradient-ayura text-white border-0"
            onClick={() => void handlePasteImport()}
          >
            Import rows
          </Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
