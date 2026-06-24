import { db } from "@/db/database";
import { getSettings } from "@/db/database";
import type { InvoiceItemRecord, InvoiceRecord } from "@/types/billing";

export interface ClinicInsights {
  todayRevenue: number;
  todayGrowth: number;
  monthRevenue: number;
  monthGrowth: number;
  outstanding: number;
  outstandingCount: number;
  lowStock: number;
  expiringSoon: number;
  avgInvoiceValue: number;
  monthlyData: { month: string; revenue: number }[];
  topTreatments: { name: string; count: number; revenue: number }[];
}

function startOfDay(epoch: number): number {
  const d = new Date(epoch);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonth(epoch: number): number {
  const d = new Date(epoch);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function computeInsights(): Promise<ClinicInsights> {
  const settings = await getSettings();
  const expiryDays = settings?.expiryAlertDays ?? 30;
  const thresholdDefault = settings?.stockThresholdDefault ?? 10;

  const invoices = await db.invoices.filter((i) => i.status === "ACTIVE").toArray();
  const medicines = await db.medicines.toArray();
  const items = await db.invoiceItems.toArray();

  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86400000;
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(new Date(new Date(now).setMonth(new Date(now).getMonth() - 1)).getTime());
  const lastMonthEnd = monthStart - 1;

  const todayInvoices = invoices.filter((i) => i.createdAt >= todayStart);
  const yesterdayInvoices = invoices.filter(
    (i) => i.createdAt >= yesterdayStart && i.createdAt < todayStart,
  );
  const monthInvoices = invoices.filter((i) => i.createdAt >= monthStart);
  const lastMonthInvoices = invoices.filter(
    (i) => i.createdAt >= lastMonthStart && i.createdAt <= lastMonthEnd,
  );

  const sum = (rows: typeof invoices) => rows.reduce((s, i) => s + i.grandTotal, 0);
  const todayRevenue = sum(todayInvoices);
  const yesterdayRevenue = sum(yesterdayInvoices);
  const monthRevenue = sum(monthInvoices);
  const lastMonthRevenue = sum(lastMonthInvoices);

  const pct = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 1000) / 10;

  const outstandingInvoices = invoices.filter((i) => i.balanceAmount > 0);

  const windowMs = expiryDays * 86400000;
  const lowStock = medicines.filter((m) => m.stockQty <= (m.minThreshold || thresholdDefault)).length;
  const expiringSoon = medicines.filter(
    (m) => m.expiryDate && m.expiryDate - now < windowMs,
  ).length;

  const monthlyData = buildMonthlySeries(invoices, 6);
  const topTreatments = buildTopTreatments(items, invoices);

  return {
    todayRevenue,
    todayGrowth: pct(todayRevenue, yesterdayRevenue),
    monthRevenue,
    monthGrowth: pct(monthRevenue, lastMonthRevenue),
    outstanding: outstandingInvoices.reduce((s, i) => s + i.balanceAmount, 0),
    outstandingCount: outstandingInvoices.length,
    lowStock,
    expiringSoon,
    avgInvoiceValue: monthInvoices.length ? monthRevenue / monthInvoices.length : 0,
    monthlyData,
    topTreatments,
  };
}

function buildMonthlySeries(invoices: InvoiceRecord[], months: number) {
  const result: { month: string; revenue: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.getTime();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
    const revenue = invoices
      .filter((inv) => inv.createdAt >= start && inv.createdAt <= end)
      .reduce((s, inv) => s + inv.grandTotal, 0);
    result.push({
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      revenue,
    });
  }
  return result;
}

function buildTopTreatments(items: InvoiceItemRecord[], invoices: InvoiceRecord[]) {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const item of items) {
    if (item.type !== "TREATMENT") continue;
    const current = map.get(item.title) ?? { count: 0, revenue: 0 };
    current.count += item.quantity;
    current.revenue += item.lineTotal;
    map.set(item.title, current);
  }
  return [...map.entries()]
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
