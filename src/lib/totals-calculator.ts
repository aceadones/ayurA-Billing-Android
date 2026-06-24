import type { BillItemInput, Totals } from "@/types/billing";

export function calculateTotals(items: BillItemInput[], paid: number): Totals {
  const consultationCount = items.filter((i) => i.type === "CONSULTATION").length;
  if (consultationCount > 1) {
    throw new Error("Only one consultation per invoice is allowed");
  }

  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const discount = item.discount ?? 0;
    const lineSubtotal = item.qty * item.unitPrice;
    subtotal += lineSubtotal;
    discountTotal += discount;
    taxTotal += (lineSubtotal - discount) * (item.taxPercent / 100);
  }

  const grandTotal = subtotal - discountTotal + taxTotal;
  const balance = Math.max(0, grandTotal - paid);

  return {
    subtotal,
    taxTotal,
    discountTotal,
    grandTotal,
    paid,
    balance,
  };
}
