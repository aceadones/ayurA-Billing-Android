import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/db/database";
import { useAppShell } from "@/hooks/use-app-shell";
import { cancelInvoice, revertInvoice } from "@/services/invoice-repository";
import { useSyncStore } from "@/stores/sync-store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  MoreVertical,
  FileText,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";

export function AllInvoicesScreen() {
  const shell = useAppShell("All Invoices", "History & management");
  const refreshSync = useSyncStore((s) => s.refresh);
  const invoices = useLiveQuery(() => db.invoices.orderBy("createdAt").reverse().toArray(), []);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      (invoices ?? []).filter(
        (inv) =>
          inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
          inv.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [invoices, search],
  );

  async function handleCancel(id: string) {
    await cancelInvoice(id);
    await refreshSync();
    toast.success("Invoice cancelled");
  }

  async function handleRevert(id: string) {
    await revertInvoice(id);
    await refreshSync();
    toast.success("Invoice reverted to active");
  }

  return (
    <AppShell {...shell}>
      <div className="screen-pad flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or invoice ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((inv) => {
            const status =
              inv.status === "CANCELLED"
                ? "cancelled"
                : inv.balanceAmount <= 0
                  ? "paid"
                  : inv.paidAmount > 0
                    ? "partial"
                    : "pending";

            return (
              <Card
                key={inv.id}
                className={cn(inv.status === "CANCELLED" && "opacity-60")}
              >
                <CardContent className="py-3 px-4 flex items-center gap-4">
                  <div className="p-2.5 bg-muted rounded-xl shrink-0">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{inv.patientName}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          status === "paid" && "status-active",
                          status === "partial" && "status-pending",
                          status === "pending" && "status-pending",
                          status === "cancelled" && "status-cancelled",
                        )}
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{inv.id}</span>
                      <Clock className="size-3" />
                      {formatDate(new Date(inv.createdAt))}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">
                      {formatCurrency(inv.grandTotal)}
                    </p>
                    {status === "partial" && (
                      <p className="text-xs text-amber-600">
                        Paid {formatCurrency(inv.paidAmount)}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="size-8 p-0 shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {inv.status !== "CANCELLED" && (
                        <DropdownMenuItem
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={() => void handleCancel(inv.id)}
                        >
                          <XCircle className="size-3.5" />
                          Cancel Invoice
                        </DropdownMenuItem>
                      )}
                      {inv.status === "CANCELLED" && (
                        <DropdownMenuItem
                          className="gap-2 text-ayura-green"
                          onClick={() => void handleRevert(inv.id)}
                        >
                          <RotateCcw className="size-3.5" />
                          Revert to Active
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
