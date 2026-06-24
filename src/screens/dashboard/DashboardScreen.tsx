import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/ayura/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatTime } from "@/lib/utils";
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  PackageX,
  CalendarClock,
  RefreshCw,
  UserRound,
  Clock,
  Pill,
  ArrowRight,
} from "lucide-react";

const SAMPLE_KPIS = {
  todayRevenue: 12450,
  todayGrowth: 8.2,
  monthRevenue: 284600,
  monthGrowth: 12.5,
  outstanding: 18200,
  outstandingCount: 7,
  lowStock: 4,
  expiringSoon: 2,
};

const RECENT_INVOICES = [
  { id: "INV-0041", patient: "Kavitha R.", amount: 1850, time: "11:30 AM", status: "paid" },
  { id: "INV-0040", patient: "Suresh M.", amount: 3200, time: "10:45 AM", status: "pending" },
  { id: "INV-0039", patient: "Priya S.", amount: 950, time: "09:20 AM", status: "paid" },
  { id: "INV-0038", patient: "Rajan K.", amount: 4100, time: "Yesterday", status: "pending" },
];

export function DashboardScreen() {
  return (
    <AppShell
      title="Dashboard"
      subtitle={new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      currentRole="front-desk"
      pendingSync={2}
      onSync={() => {}}
      onLock={() => {}}
    >
      <div className="screen-pad flex flex-col gap-5">
        {/* ── Pharmacist selector ── */}
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
          <Select defaultValue="meera">
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meera">Meera R.</SelectItem>
              <SelectItem value="ravi">Ravi K.</SelectItem>
              <SelectItem value="none">— None —</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* ── KPI grid ── */}
        <div className="grid grid-cols-2 landscape:grid-cols-4 gap-3">
          <KpiCard
            title="Today's Revenue"
            value={formatCurrency(SAMPLE_KPIS.todayRevenue)}
            icon={IndianRupee}
            trend={{ value: SAMPLE_KPIS.todayGrowth, label: "vs yesterday" }}
            variant="success"
          />
          <KpiCard
            title="Monthly Revenue"
            value={formatCurrency(SAMPLE_KPIS.monthRevenue)}
            icon={TrendingUp}
            trend={{ value: SAMPLE_KPIS.monthGrowth, label: "vs last month" }}
          />
          <KpiCard
            title="Outstanding"
            value={formatCurrency(SAMPLE_KPIS.outstanding)}
            subtitle={`${SAMPLE_KPIS.outstandingCount} invoices`}
            icon={AlertCircle}
            variant="warning"
          />
          <KpiCard
            title="Alerts"
            value={`${SAMPLE_KPIS.lowStock + SAMPLE_KPIS.expiringSoon}`}
            subtitle={`${SAMPLE_KPIS.lowStock} low stock · ${SAMPLE_KPIS.expiringSoon} expiring`}
            icon={PackageX}
            variant="danger"
          />
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
          { label: "New Invoice", icon: IndianRupee, href: "/invoice", accent: true },
          { label: "New Booking", icon: CalendarClock, href: "/booking", accent: false },
          { label: "Check Stock", icon: PackageX, href: "/stock", accent: false },
        ].map(({ label, icon: Icon, accent }) => (
            <Button
              key={label}
              variant={accent ? "default" : "outline"}
              className={
                accent
                  ? "h-12 gradient-ayura text-white border-0 shadow-sm shadow-ayura-green/20 flex gap-2"
                  : "h-12 flex gap-2"
              }
              onClick={() => {}}
            >
              <Icon className="size-4" />
              <span className="text-sm">{label}</span>
            </Button>
          ))}
        </div>

        {/* ── Recent invoices ── */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
              View all <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              {RECENT_INVOICES.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-ayura-green-light flex items-center justify-center shrink-0">
                      <UserRound className="size-4 text-ayura-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.patient}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {inv.time} · {inv.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {formatCurrency(inv.amount)}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        inv.status === "paid"
                          ? "status-active text-xs"
                          : "status-pending text-xs"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
