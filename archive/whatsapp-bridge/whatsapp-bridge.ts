import type { InvoiceDraft } from "@/types/billing";

export interface WhatsAppDispatchResult {
  ok: boolean;
  message: string;
}

export async function sendInvoiceWhatsApp(
  phone: string,
  patientName: string,
  pdfUrl: string,
  draft: InvoiceDraft,
): Promise<WhatsAppDispatchResult> {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length < 10) {
    return { ok: false, message: "Invalid phone number" };
  }

  const summary = [
    `Hello ${patientName},`,
    "",
    `Your invoice ${draft.invoiceId} from ayurA Wellness Centre.`,
    `Total: ₹${draft.totals.grandTotal.toFixed(2)}`,
    draft.totals.balance > 0 ? `Balance due: ₹${draft.totals.balance.toFixed(2)}` : "Paid in full. Thank you!",
  ].join("\n");

  const whatsappUrl = `https://wa.me/91${normalized.slice(-10)}?text=${encodeURIComponent(summary)}`;

  window.open(whatsappUrl, "_blank");

  return {
    ok: true,
    message: pdfUrl ? "WhatsApp opened with invoice summary" : "WhatsApp opened",
  };
}

export function generatePatientSummary(draft: InvoiceDraft): string {
  const lines = draft.items.map((i) => `- ${i.title} × ${i.qty}`).join("\n");
  return [
    `Invoice ${draft.invoiceId} for ${draft.patientName}`,
    lines,
    `Total: ₹${draft.totals.grandTotal.toFixed(2)}`,
  ].join("\n");
}
