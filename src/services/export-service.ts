import * as XLSX from "xlsx";
import { db } from "@/db/database";
import { formatCurrency } from "@/lib/utils";

export async function exportInvoicesCsv(from?: number, to?: number): Promise<void> {
  const rows = await loadInvoiceRows(from, to);
  const csv = [
    ["Invoice ID", "Patient", "Phone", "Status", "Grand Total", "Paid", "Balance", "Date"].join(","),
    ...rows.map((r) =>
      [
        r.id,
        `"${r.patientName.replace(/"/g, '""')}"`,
        r.patientPhone ?? "",
        r.status,
        r.grandTotal,
        r.paidAmount,
        r.balanceAmount,
        new Date(r.createdAt).toISOString(),
      ].join(","),
    ),
  ].join("\n");

  downloadTextFile(csv, "invoices_export.csv", "text/csv");
}

export async function exportInvoicesXlsx(from?: number, to?: number): Promise<void> {
  const rows = await loadInvoiceRows(from, to);
  const sheetData = rows.map((r) => ({
    "Invoice ID": r.id,
    Patient: r.patientName,
    Phone: r.patientPhone ?? "",
    Status: r.status,
    "Grand Total": r.grandTotal,
    Paid: r.paidAmount,
    Balance: r.balanceAmount,
    Date: new Date(r.createdAt).toLocaleString("en-IN"),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, "invoices_export.xlsx");
}

async function loadInvoiceRows(from?: number, to?: number) {
  let invoices = await db.invoices.orderBy("createdAt").reverse().toArray();
  if (from) invoices = invoices.filter((i) => i.createdAt >= from);
  if (to) invoices = invoices.filter((i) => i.createdAt <= to);
  return invoices;
}

function downloadTextFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatExportSummary(count: number, total: number): string {
  return `${count} invoices · ${formatCurrency(total)} total`;
}
