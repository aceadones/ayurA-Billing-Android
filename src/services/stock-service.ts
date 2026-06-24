import { db } from "@/db/database";
import type { Medicine } from "@/types/billing";
import { newId } from "@/lib/id";

export async function upsertMedicine(
  data: Omit<Medicine, "id" | "updatedAt"> & { id?: string },
): Promise<string> {
  const id = data.id ?? newId("med");
  await db.medicines.put({
    ...data,
    id,
    updatedAt: Date.now(),
  });
  return id;
}

export async function updateMedicineQty(id: string, stockQty: number): Promise<void> {
  await db.medicines.update(id, { stockQty, updatedAt: Date.now() });
}

export async function deleteMedicine(id: string): Promise<void> {
  await db.medicines.delete(id);
}

export interface ParsedMedicineRow {
  name: string;
  stockQty: number;
  minThreshold: number;
  expiryDate?: number;
}

export function parseMedicineCsv(text: string): ParsedMedicineRow[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, qty, threshold, expiryEpoch] = line.split(",").map((s) => s.trim());
      return {
        name,
        stockQty: Number(qty) || 0,
        minThreshold: Number(threshold) || 10,
        expiryDate: expiryEpoch ? Number(expiryEpoch) : undefined,
      };
    })
    .filter((row) => row.name.length > 0);
}

export async function importMedicineRows(rows: ParsedMedicineRow[]): Promise<number> {
  const now = Date.now();
  await db.medicines.bulkPut(
    rows.map((row) => ({
      id: newId("med"),
      name: row.name,
      stockQty: row.stockQty,
      unitPrice: 100,
      taxPercent: 5,
      minThreshold: row.minThreshold,
      expiryDate: row.expiryDate,
      updatedAt: now,
    })),
  );
  return rows.length;
}

export function getStockStatus(
  medicine: Medicine,
  expiryAlertDays: number,
): "low" | "expiring" | "ok" {
  const windowMs = expiryAlertDays * 24 * 60 * 60 * 1000;
  if (medicine.stockQty <= medicine.minThreshold) return "low";
  if (medicine.expiryDate && medicine.expiryDate - Date.now() < windowMs) return "expiring";
  return "ok";
}
