import { jsPDF } from "jspdf";
import type { InvoiceDraft } from "@/types/billing";
import { formatCurrency } from "@/lib/utils";
import { getSettings } from "@/db/database";

export async function generateInvoicePdf(draft: InvoiceDraft): Promise<string> {
  const settings = await getSettings();
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const clinicName = settings?.clinicName ?? "ayurA Wellness Centre";
  const address = settings?.address ?? "";
  const phone = settings?.phone ?? "";

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(clinicName, 48, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (address) {
    doc.text(address, 48, y);
    y += 14;
  }
  if (phone) {
    doc.text(`Phone: ${phone}`, 48, y);
    y += 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("INVOICE", 48, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice ID: ${draft.invoiceId}`, 48, y);
  y += 14;
  doc.text(`Patient: ${draft.patientName}`, 48, y);
  y += 14;
  if (draft.patientPhone) {
    doc.text(`Phone: ${draft.patientPhone}`, 48, y);
    y += 14;
  }
  doc.text(`Date: ${new Date(draft.createdAt).toLocaleString("en-IN")}`, 48, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.text("Item", 48, y);
  doc.text("Qty", 260, y);
  doc.text("Price", 310, y);
  doc.text("Total", 400, y);
  y += 12;
  doc.setDrawColor(200);
  doc.line(48, y, 545, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  for (const item of draft.items) {
    const discount = item.discount ?? 0;
    const lineTotal = item.qty * item.unitPrice - discount;
    doc.text(item.title.slice(0, 32), 48, y);
    doc.text(String(item.qty), 260, y);
    doc.text(formatCurrency(item.unitPrice), 310, y);
    doc.text(formatCurrency(lineTotal), 400, y);
    y += 16;
    if (y > 720) {
      doc.addPage();
      y = 48;
    }
  }

  y += 8;
  doc.line(48, y, 545, y);
  y += 18;
  doc.text(`Subtotal: ${formatCurrency(draft.totals.subtotal)}`, 320, y);
  y += 14;
  doc.text(`Discount: ${formatCurrency(draft.totals.discountTotal)}`, 320, y);
  y += 14;
  doc.text(`Tax: ${formatCurrency(draft.totals.taxTotal)}`, 320, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: ${formatCurrency(draft.totals.grandTotal)}`, 320, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.text(`Paid: ${formatCurrency(draft.totals.paid)}`, 320, y);
  y += 14;
  doc.text(`Balance: ${formatCurrency(draft.totals.balance)}`, 320, y);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return url;
}

export function downloadPdfBlobUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
