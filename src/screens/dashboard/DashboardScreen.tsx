import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/ayura/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db/database";
import { computeInsights } from "@/services/insights-service";
import { useAppShell } from "@/hooks/use-app-shell";
import { useSessionStore } from "@/stores/session-store";
import { formatCurrency } from "@/lib/utils";
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  PackageX,
  CalendarClock,
  UserRound,
  Clock,
  Pill,
  ArrowRight,
} from "lucide-react";

export function DashboardScreen() {
  const navigate = useNavigate();
  const shell = useAppShell(
    "Dashboard",
    new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );

  const pharmacists = useLiveQuery(() => db.pharmacists.filter((p) => p.active).toArray(), []);
  const insights = useLiveQuery(() => computeInsights(), []);
  const recentInvoices = useLiveQuery(
    () => db.invoices.orderBy("createdAt").reverse().limit(4).toArray(),
    [],
  );

  const activePharmacistId = useSessionStore((s) => s.activePharmacistId);
  const setActivePharmacist = useSessionStore((s) => s.setActivePharmacist);

  return (
    <AppShell {...shell}>
      <div className="screen-pad flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-ayura-green-light rounded-lg">
              <Pill className="size-4 text-ayura-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On duty</p>
              <p className="text-sm font-semibold leading-tight">Pharmacist</p>
            </div>
          </div>
          <Select
            value={activePharmacistId ?? "none"}
            onValueChange={(v) => setActivePharmacist(v === "none" ? null : v)}
          >
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(pharmacists ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
              <SelectItem value="none">— None —</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="grid grid-cols-2 landscape:grid-cols-4 gap-3">
          <KpiCard
            title="Today's Revenue"
            value={formatCurrency(insights?.todayRevenue ?? 0)}
            icon={IndianRupee}
            trend={{
              value: insights?.todayGrowth ?? 0,
              label: "vs yesterday",
            }}
            variant="success"
          />
          <KpiCard
            title="Monthly Revenue"
            value={formatCurrency(insights?.monthRevenue ?? 0)}
            icon={TrendingUp}
            trend={{
              value: insights?.monthGrowth ?? 0,
              label: "vs last month",
            }}
          />
          <KpiCard
            title="Outstanding"
            value={formatCurrency(insights?.outstanding ?? 0)}
            subtitle={`${insights?.outstandingCount ?? 0} invoices`}
            icon={AlertCircle}
            variant="warning"
          />
          <KpiCard
            title="Alerts"
            value={`${(insights?.lowStock ?? 0) + (insights?.expiringSoon ?? 0)}`}
            subtitle={`${insights?.lowStock ?? 0} low stock · ${insights?.expiringSoon ?? 0} expiring`}
            icon={PackageX}
            variant="danger"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="default"
            className="h-12 gradient-ayura text-white border-0 shadow-sm shadow-ayura-green/20 flex gap-2"
            onClick={() => navigate("/invoice")}
          >
            <IndianRupee className="size-4" />
            <span className="text-sm">New Invoice</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 flex gap-2"
            onClick={() => navigate("/booking")}
          >
            <CalendarClock className="size-4" />
            <span className="text-sm">New Booking</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 flex gap-2"
            onClick={() => navigate("/stock")}
          >
            <PackageX className="size-4" />
            <span className="text-sm">Check Stock</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-muted-foreground"
              onClick={() => navigate("/all-invoices")}
            >
              View all <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              {(recentInvoices ?? []).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-ayura-green-light flex items-center justify-center shrink-0">
                      <UserRound className="size-4 text-ayura-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.patientName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(inv.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {inv.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {formatCurrency(inv.grandTotal)}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        inv.balanceAmount <= 0
                          ? "status-active text-xs"
                          : "status-pending text-xs"
                      }
                    >
                      {inv.balanceAmount <= 0 ? "paid" : "pending"}
                    </Badge>
                  </div>
                </div>
              ))}
              {(recentInvoices ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No invoices yet. Create your first invoice.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
