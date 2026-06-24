import { db } from "@/db/database";
import { enqueueSync } from "@/services/sync-engine";
import type { InvoiceDraft } from "@/types/billing";
import { newId } from "@/lib/id";

export async function saveInvoice(draft: InvoiceDraft): Promise<void> {
  const now = Date.now();
  const consultationItem = draft.items.find((i) => i.type === "CONSULTATION");

  await db.transaction(
    "rw",
    [db.medicines, db.invoices, db.invoiceItems, db.payments, db.syncQueue],
    async () => {
      for (const item of draft.items) {
        if (item.type !== "MEDICINE") continue;
        const medicine = await db.medicines.get(item.id);
        if (!medicine) {
          throw new Error(`Medicine not found: ${item.title}`);
        }
        const nextStock = medicine.stockQty - item.qty;
        if (nextStock < 0) {
          throw new Error(`Insufficient stock for ${medicine.name}`);
        }
        await db.medicines.update(item.id, {
          stockQty: nextStock,
          updatedAt: now,
        });
      }

      await db.invoices.put({
        id: draft.invoiceId,
        patientName: draft.patientName,
        patientPhone: draft.patientPhone,
        pharmacistId: draft.pharmacistId,
        consultationItemId: consultationItem?.id,
        subtotal: draft.totals.subtotal,
        discount: draft.totals.discountTotal,
        taxTotal: draft.totals.taxTotal,
        grandTotal: draft.totals.grandTotal,
        paidAmount: draft.totals.paid,
        balanceAmount: draft.totals.balance,
        status: "ACTIVE",
        createdAt: draft.createdAt,
        updatedAt: now,
        isSynced: false,
      });

      for (const item of draft.items) {
        const discount = item.discount ?? 0;
        await db.invoiceItems.put({
          id: item.id,
          invoiceId: draft.invoiceId,
          type: item.type,
          medicineId: item.type === "MEDICINE" ? item.id : undefined,
          treatmentId: item.type === "TREATMENT" ? item.id : undefined,
          title: item.title,
          quantity: item.qty,
          unitPrice: item.unitPrice,
          taxPercent: item.taxPercent,
          discountAmount: discount,
          lineTotal: item.qty * item.unitPrice - discount,
        });
      }

      for (const payment of draft.payments) {
        await db.payments.put({
          id: newId("pay"),
          invoiceId: draft.invoiceId,
          method: payment.method,
          amount: payment.amount,
          referenceNote: payment.referenceNote,
          paidAt: now,
        });
      }

      await enqueueSync("invoices", draft.invoiceId, "CREATE", {
        invoiceId: draft.invoiceId,
      });
    },
  );
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
  const now = Date.now();
  await db.invoices.update(invoiceId, {
    status: "CANCELLED",
    cancelledAt: now,
    updatedAt: now,
    isSynced: false,
  });
  await enqueueSync("invoices", invoiceId, "UPDATE", { status: "CANCELLED" }, 9);
}

export async function revertInvoice(invoiceId: string): Promise<void> {
  const now = Date.now();
  await db.invoices.update(invoiceId, {
    status: "ACTIVE",
    cancelledAt: undefined,
    updatedAt: now,
    isSynced: false,
  });
  await enqueueSync("invoices", invoiceId, "UPDATE", { status: "ACTIVE" }, 9);
}

export async function pendingSyncCount(): Promise<number> {
  return db.syncQueue.where("status").anyOf(["PENDING", "FAILED"]).count();
}
