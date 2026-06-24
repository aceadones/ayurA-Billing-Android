import { useState } from "react";
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
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import {
  Search,
  MoreVertical,
  UserRound,
  Clock,
  FileText,
  XCircle,
  RotateCcw,
} from "lucide-react";

type InvoiceStatus = "paid" | "partial" | "pending" | "cancelled";

interface Invoice {
  id: string;
  patient: string;
  amount: number;
  paid: number;
  date: Date;
  status: InvoiceStatus;
}

const SAMPLE_INVOICES: Invoice[] = [
  { id: "INV-0041", patient: "Kavitha R.", amount: 1850, paid: 1850, date: new Date(), status: "paid" },
  { id: "INV-0040", patient: "Suresh M.", amount: 3200, paid: 1500, date: new Date(), status: "partial" },
  { id: "INV-0039", patient: "Anjali V.", amount: 950, paid: 950, date: new Date(), status: "paid" },
  { id: "INV-0038", patient: "Rajan K.", amount: 4100, paid: 0, date: new Date(Date.now() - 86400000), status: "pending" },
  { id: "INV-0037", patient: "Meena L.", amount: 2200, paid: 2200, date: new Date(Date.now() - 86400000), status: "paid" },
  { id: "INV-0036", patient: "Vivek T.", amount: 1600, paid: 1600, date: new Date(Date.now() - 172800000), status: "cancelled" },
];

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  paid: "status-active",
  partial: "status-pending",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "status-cancelled",
};

export function AllInvoicesScreen() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_INVOICES.filter(
    (inv) =>
      inv.patient.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell title="All Invoices" subtitle="History & management" currentRole="admin" onLock={() => {}}>
      <div className="screen-pad flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or invoice ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Invoice list */}
        <div className="flex flex-col gap-2">
          {filtered.map((inv) => (
            <Card
              key={inv.id}
              className={cn(
                inv.status === "cancelled" && "opacity-60",
              )}
            >
              <CardContent className="py-3 px-4 flex items-center gap-4">
                <div className="p-2.5 bg-muted rounded-xl shrink-0">
                  <FileText className="size-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{inv.patient}</p>
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGE[inv.status])}>
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{inv.id}</span>
                    <Clock className="size-3" />
                    {formatDate(inv.date)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{formatCurrency(inv.amount)}</p>
                  {inv.status === "partial" && (
                    <p className="text-xs text-amber-600">
                      Paid {formatCurrency(inv.paid)}
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
                    <DropdownMenuItem className="gap-2">
                      <FileText className="size-3.5" />
                      View / Print
                    </DropdownMenuItem>
                    {inv.status !== "cancelled" && (
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <XCircle className="size-3.5" />
                        Cancel Invoice
                      </DropdownMenuItem>
                    )}
                    {inv.status === "cancelled" && (
                      <DropdownMenuItem className="gap-2 text-ayura-green">
                        <RotateCcw className="size-3.5" />
                        Revert to Active
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
