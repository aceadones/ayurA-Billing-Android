import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/ayura/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeInsights } from "@/services/insights-service";
import { useAppShell } from "@/hooks/use-app-shell";
import { formatCurrency } from "@/lib/utils";
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  PackageX,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";

export function InsightsScreen() {
  const shell = useAppShell("Insights", "Clinic performance");
  const insights = useLiveQuery(() => computeInsights(), []);

  const monthlyData = insights?.monthlyData ?? [];
  const maxRev = Math.max(...monthlyData.map((d) => d.revenue), 1);

  return (
    <AppShell {...shell}>
      <div className="screen-pad flex flex-col gap-5">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="flex flex-col gap-5">
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
                  title="This Month"
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
                  title="Stock Alerts"
                  value={`${(insights?.lowStock ?? 0) + (insights?.expiringSoon ?? 0)}`}
                  subtitle={`${insights?.lowStock ?? 0} low · ${insights?.expiringSoon ?? 0} expiring`}
                  icon={PackageX}
                  variant="danger"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-ayura-green-light border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ayura-green">Monthly Growth</p>
                      <ArrowUpRight className="size-4 text-emerald-600" />
                    </div>
                    <p className="font-display text-3xl font-semibold text-ayura-green mt-1">
                      {(insights?.monthGrowth ?? 0) > 0 ? "+" : ""}
                      {insights?.monthGrowth ?? 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-ayura-gold-light border-amber-200">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-amber-700">Avg Invoice Value</p>
                    <p className="font-display text-3xl font-semibold text-amber-700 mt-1">
                      {formatCurrency(insights?.avgInvoiceValue ?? 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="size-4 text-ayura-green" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {monthlyData.map((d, i) => {
                    const height = (d.revenue / maxRev) * 100;
                    const isCurrent = i === monthlyData.length - 1;
                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {d.revenue > 0
                            ? `${Math.round(d.revenue / 1000)}k`
                            : "0"}
                        </span>
                        <div
                          className={`w-full rounded-t-lg ${
                            isCurrent ? "gradient-ayura" : "bg-ayura-green/30"
                          }`}
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            isCurrent ? "text-ayura-green" : "text-muted-foreground"
                          }`}
                        >
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Top Treatments</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col divide-y divide-border">
                  {(insights?.topTreatments ?? []).map((t, i) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
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
                  {(insights?.topTreatments ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No treatment invoice data yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
