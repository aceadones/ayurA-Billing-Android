import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/ayura/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  PackageX,
  CalendarX,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const MONTHLY_DATA = [
  { month: "Jan", revenue: 210000 },
  { month: "Feb", revenue: 185000 },
  { month: "Mar", revenue: 245000 },
  { month: "Apr", revenue: 268000 },
  { month: "May", revenue: 302000 },
  { month: "Jun", revenue: 284600 },
];

const MAX_REV = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

const TOP_TREATMENTS = [
  { name: "Panchakarma", count: 42, revenue: 126000 },
  { name: "Abhyanga", count: 38, revenue: 57000 },
  { name: "Shirodhara", count: 21, revenue: 42000 },
  { name: "Nadi Pariksha", count: 67, revenue: 33500 },
];

export function InsightsScreen() {
  return (
    <AppShell title="Insights" subtitle="Clinic performance" currentRole="admin" onLock={() => {}}>
      <div className="screen-pad flex flex-col gap-5">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-4">
            <div className="flex flex-col gap-5">
              {/* KPI grid */}
              <div className="grid grid-cols-2 landscape:grid-cols-4 gap-3">
                <KpiCard
                  title="Today's Revenue"
                  value={formatCurrency(12450)}
                  icon={IndianRupee}
                  trend={{ value: 8.2, label: "vs yesterday" }}
                  variant="success"
                />
                <KpiCard
                  title="This Month"
                  value={formatCurrency(284600)}
                  icon={TrendingUp}
                  trend={{ value: 12.5, label: "vs last month" }}
                />
                <KpiCard
                  title="Outstanding"
                  value={formatCurrency(18200)}
                  subtitle="7 invoices"
                  icon={AlertCircle}
                  variant="warning"
                />
                <KpiCard
                  title="Stock Alerts"
                  value="6"
                  subtitle="4 low · 2 expiring"
                  icon={PackageX}
                  variant="danger"
                />
              </div>

              {/* Growth cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-ayura-green-light border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ayura-green">Monthly Growth</p>
                      <ArrowUpRight className="size-4 text-emerald-600" />
                    </div>
                    <p className="font-display text-3xl font-semibold text-ayura-green mt-1">+12.5%</p>
                    <p className="text-xs text-ayura-green/70 mt-0.5">vs last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-ayura-gold-light border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-amber-700">Avg Invoice Value</p>
                      <IndianRupee className="size-4 text-amber-600" />
                    </div>
                    <p className="font-display text-3xl font-semibold text-amber-700 mt-1">
                      {formatCurrency(2340)}
                    </p>
                    <p className="text-xs text-amber-600/70 mt-0.5">per invoice this month</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Revenue chart */}
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="size-4 text-ayura-green" />
                  Monthly Revenue (2026)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simple bar chart built with divs */}
                <div className="flex items-end gap-2 h-40">
                  {MONTHLY_DATA.map((d) => {
                    const height = (d.revenue / MAX_REV) * 100;
                    const isCurrent = d.month === "Jun";
                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatCurrency(d.revenue / 1000).replace("₹", "")}k
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isCurrent ? "gradient-ayura" : "bg-ayura-green/30"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        <span className={`text-[10px] font-medium ${isCurrent ? "text-ayura-green" : "text-muted-foreground"}`}>
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top treatments */}
          <TabsContent value="treatments" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Top Treatments (June)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col divide-y divide-border">
                  {TOP_TREATMENTS.map((t, i) => (
                    <div key={t.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.count} sessions</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm text-ayura-green">
                        {formatCurrency(t.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
