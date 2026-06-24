import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Medicine {
  id: string;
  name: string;
  qty: number;
  threshold: number;
  expiry: Date | null;
  unit: string;
}

const SAMPLE: Medicine[] = [
  { id: "1", name: "Ashwagandha Churna", qty: 24, threshold: 10, expiry: new Date("2026-09-15"), unit: "pkt" },
  { id: "2", name: "Triphala Tablets", qty: 7, threshold: 10, expiry: new Date("2026-07-01"), unit: "btl" },
  { id: "3", name: "Brahmi Oil", qty: 3, threshold: 5, expiry: new Date("2026-06-30"), unit: "btl" },
  { id: "4", name: "Chyawanprash", qty: 18, threshold: 8, expiry: new Date("2027-03-01"), unit: "jar" },
  { id: "5", name: "Neem Capsules", qty: 45, threshold: 15, expiry: new Date("2027-01-20"), unit: "btl" },
];

function getStockStatus(m: Medicine): "low" | "expiring" | "ok" {
  const nowMs = Date.now();
  const expiryMs = m.expiry ? m.expiry.getTime() : Infinity;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (m.qty <= m.threshold) return "low";
  if (expiryMs - nowMs < thirtyDays) return "expiring";
  return "ok";
}

export function StockScreen() {
  const [search, setSearch] = useState("");
  const [medicines] = useState<Medicine[]>(SAMPLE);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const lowCount = medicines.filter((m) => m.qty <= m.threshold).length;
  const expiringCount = medicines.filter((m) => {
    const ms = m.expiry ? m.expiry.getTime() - Date.now() : Infinity;
    return ms < 30 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <AppShell title="Stock" subtitle="Medicine inventory" currentRole="front-desk" onLock={() => {}}>
      <div className="screen-pad flex flex-col gap-4">
        {/* Alert pills */}
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

        {/* Search + actions */}
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
          <Button size="sm" className="gradient-ayura text-white border-0 h-9 gap-1.5 shrink-0">
            <Plus className="size-4" />
            Add
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 shrink-0">
            <ClipboardPaste className="size-4" />
            Paste CSV
          </Button>
        </div>

        <Separator />

        {/* Medicine list */}
        <div className="flex flex-col gap-2">
          {filtered.map((m) => {
            const status = getStockStatus(m);
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
                        {m.qty} {m.unit} · threshold {m.threshold}
                      </span>
                      {m.expiry && (
                        <span className={cn(status === "expiring" && "text-rose-600")}>
                          <CalendarX className="size-3 inline mr-0.5" />
                          {formatDate(m.expiry)}
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Update quantity</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
