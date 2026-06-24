import Dexie, { type EntityTable } from "dexie";
import type {
  ClinicSettings,
  Doctor,
  DoctorAvailabilityOverride,
  DoctorBooking,
  InvoiceItemRecord,
  InvoiceRecord,
  Medicine,
  PaymentRecord,
  Pharmacist,
  SyncQueueEntry,
  Treatment,
  TreatmentBooking,
} from "@/types/billing";

export class AyuraDatabase extends Dexie {
  clinicSettings!: EntityTable<ClinicSettings, "id">;
  medicines!: EntityTable<Medicine, "id">;
  treatments!: EntityTable<Treatment, "id">;
  doctors!: EntityTable<Doctor, "id">;
  pharmacists!: EntityTable<Pharmacist, "id">;
  invoices!: EntityTable<InvoiceRecord, "id">;
  invoiceItems!: EntityTable<InvoiceItemRecord, "id">;
  payments!: EntityTable<PaymentRecord, "id">;
  treatmentBookings!: EntityTable<TreatmentBooking, "id">;
  doctorBookings!: EntityTable<DoctorBooking, "id">;
  doctorAvailabilityOverrides!: EntityTable<DoctorAvailabilityOverride, "id">;
  syncQueue!: EntityTable<SyncQueueEntry, "id">;

  constructor() {
    super("ayura-billing");

    this.version(1).stores({
      clinicSettings: "id",
      medicines: "id, name, expiryDate",
      treatments: "id, name, active",
      doctors: "id, name, active",
      pharmacists: "id, name, active",
      invoices: "id, patientName, status, createdAt, isSynced",
      invoiceItems: "id, invoiceId, type",
      payments: "id, invoiceId",
      treatmentBookings: "id, treatmentId, dateEpoch, slot, status",
      doctorBookings: "id, doctorId, dateEpoch, status",
      doctorAvailabilityOverrides: "id, doctorId, dateEpoch",
      syncQueue: "id, status, priority, updatedAt, entityType, entityId",
    });
  }
}

export const db = new AyuraDatabase();

export async function getSettings(): Promise<ClinicSettings | undefined> {
  return db.clinicSettings.get("default");
}

export async function isOnboardingComplete(): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(settings?.onboardingComplete && settings.deviceAuthorized);
}

export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue
    .where("status")
    .anyOf(["PENDING", "FAILED"])
    .count();
}

export async function getLastSyncTime(): Promise<number | null> {
  const synced = await db.syncQueue
    .where("status")
    .equals("SYNCED")
    .reverse()
    .sortBy("updatedAt");
  return synced[0]?.updatedAt ?? null;
}
