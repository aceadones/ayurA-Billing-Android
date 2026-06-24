import { db } from "@/db/database";
import { hashSecret } from "@/services/password-hasher";
import type { ClinicSettings, OnboardingDraft } from "@/types/billing";
import { newId } from "@/lib/id";

export async function completeOnboarding(draft: OnboardingDraft): Promise<ClinicSettings> {
  const now = Date.now();

  let adminPasswordHash: string;
  let frontDeskPinHash: string;
  let doctorPinHash: string;
  let deviceTokenHash: string;

  try {
    [adminPasswordHash, frontDeskPinHash, doctorPinHash, deviceTokenHash] =
      await Promise.all([
        hashSecret(draft.adminPassword),
        hashSecret(draft.frontDeskPin),
        hashSecret(draft.doctorPin),
        hashSecret(draft.deviceKey),
      ]);
  } catch (error) {
    throw new Error("Failed to secure credentials. Please try again.");
  }

  const pharmacistId = newId("ph");
  const doctorId = newId("doc");

  await db.transaction(
    "rw",
    [
      db.clinicSettings,
      db.doctors,
      db.pharmacists,
      db.treatments,
      db.medicines,
      db.treatmentBookings,
      db.doctorBookings,
    ],
    async () => {
      const settings: ClinicSettings = {
        id: "default",
        clinicName: draft.clinicName,
        address: draft.address,
        phone: draft.phone,
        logoUri: draft.logoUri || undefined,
        slotDurationMinutes: parseInt(draft.slotDuration, 10) || 30,
        stockThresholdDefault: parseInt(draft.stockThreshold, 10) || 10,
        expiryAlertDays: parseInt(draft.expiryWindow, 10) || 30,
        deviceAuthorized: true,
        deviceToken: deviceTokenHash,
        adminPasswordHash,
        frontDeskPinHash,
        onboardingComplete: true,
      };

      await db.clinicSettings.put(settings);

      await db.doctors.put({
        id: doctorId,
        name: draft.doctorName,
        pinHash: doctorPinHash,
        specialization: "Panchakarma",
        active: true,
      });

      await db.pharmacists.put({
        id: pharmacistId,
        name: draft.pharmacistName,
        active: true,
      });

      const existingTreatments = await db.treatments.count();
      if (existingTreatments === 0) {
        await db.treatments.bulkPut([
          { id: newId("tr"), name: "Panchakarma", fee: 3000, slotCapacity: 2, active: true },
          { id: newId("tr"), name: "Abhyanga", fee: 1500, slotCapacity: 3, active: true },
          { id: newId("tr"), name: "Shirodhara", fee: 2000, slotCapacity: 2, active: true },
          { id: newId("tr"), name: "Nadi Pariksha", fee: 500, slotCapacity: 4, active: true },
        ]);
      }

      const existingMedicines = await db.medicines.count();
      if (existingMedicines === 0) {
        const threshold = parseInt(draft.stockThreshold, 10) || 10;
        await db.medicines.bulkPut([
          {
            id: newId("med"),
            name: "Ashwagandha Churna",
            stockQty: 24,
            unitPrice: 120,
            taxPercent: 5,
            expiryDate: new Date("2026-09-15").getTime(),
            minThreshold: threshold,
            updatedAt: now,
          },
          {
            id: newId("med"),
            name: "Triphala Tablets",
            stockQty: 7,
            unitPrice: 85,
            taxPercent: 5,
            expiryDate: new Date("2026-07-01").getTime(),
            minThreshold: threshold,
            updatedAt: now,
          },
          {
            id: newId("med"),
            name: "Brahmi Oil",
            stockQty: 3,
            unitPrice: 220,
            taxPercent: 5,
            expiryDate: new Date("2026-06-30").getTime(),
            minThreshold: 5,
            updatedAt: now,
          },
          {
            id: newId("med"),
            name: "Chyawanprash",
            stockQty: 18,
            unitPrice: 350,
            taxPercent: 5,
            expiryDate: new Date("2027-03-01").getTime(),
            minThreshold: threshold,
            updatedAt: now,
          },
          {
            id: newId("med"),
            name: "Neem Capsules",
            stockQty: 45,
            unitPrice: 95,
            taxPercent: 5,
            expiryDate: new Date("2027-01-20").getTime(),
            minThreshold: threshold,
            updatedAt: now,
          },
        ]);
      }

      return settings;
    },
  );

  localStorage.setItem("ayura_onboarding_draft", JSON.stringify(draft));
  const saved = await db.clinicSettings.get("default");
  if (!saved?.onboardingComplete) {
    throw new Error("Setup did not save correctly. Please try again.");
  }
  return saved;
}

export async function verifyDeviceKey(deviceKey: string): Promise<boolean> {
  const settings = await db.clinicSettings.get("default");
  if (!settings?.deviceToken) return false;
  const { verifySecret } = await import("@/services/password-hasher");
  return verifySecret(deviceKey, settings.deviceToken);
}
