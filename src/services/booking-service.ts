import { db } from "@/db/database";
import { newId } from "@/lib/id";
import type { Doctor, Treatment } from "@/types/billing";
import { hashSecret } from "@/services/password-hasher";

export async function addDoctor(name: string, pin: string, specialization?: string): Promise<void> {
  await db.doctors.put({
    id: newId("doc"),
    name,
    pinHash: await hashSecret(pin),
    specialization,
    active: true,
  });
}

export async function addTreatment(name: string, fee: number, slotCapacity = 2): Promise<void> {
  await db.treatments.put({
    id: newId("tr"),
    name,
    fee,
    slotCapacity,
    active: true,
  });
}

export async function getActiveDoctors(): Promise<Doctor[]> {
  return db.doctors.filter((d) => d.active).toArray();
}

export async function getActiveTreatments(): Promise<Treatment[]> {
  return db.treatments.filter((t) => t.active).toArray();
}

export async function addTreatmentBooking(input: {
  patientName: string;
  treatmentId: string;
  dateEpoch: number;
  slot: string;
}): Promise<void> {
  const treatment = await db.treatments.get(input.treatmentId);
  if (!treatment) throw new Error("Treatment not found");

  const activeCount = await db.treatmentBookings
    .filter(
      (b) =>
        b.treatmentId === input.treatmentId &&
        b.dateEpoch === input.dateEpoch &&
        b.slot === input.slot &&
        b.status !== "CANCELLED",
    )
    .count();

  if (activeCount >= treatment.slotCapacity) {
    throw new Error("Slot is fully booked");
  }

  await db.treatmentBookings.put({
    id: newId("tb"),
    patientName: input.patientName,
    treatmentId: input.treatmentId,
    dateEpoch: input.dateEpoch,
    slot: input.slot,
    status: "confirmed",
  });
}

export async function addDoctorBooking(input: {
  patientName: string;
  doctorId: string;
  dateEpoch: number;
  timeText: string;
}): Promise<void> {
  const existing = await db.doctorBookings
    .filter(
      (b) =>
        b.doctorId === input.doctorId &&
        b.dateEpoch === input.dateEpoch &&
        b.timeText === input.timeText &&
        b.status !== "CANCELLED",
    )
    .count();

  if (existing > 0) throw new Error("Doctor slot already booked");

  await db.doctorBookings.put({
    id: newId("db"),
    patientName: input.patientName,
    doctorId: input.doctorId,
    dateEpoch: input.dateEpoch,
    timeText: input.timeText,
    status: "confirmed",
  });
}

export async function addAvailabilityOverride(input: {
  doctorId: string;
  dateEpoch: number;
  startTime: string;
  endTime: string;
  reason?: string;
}): Promise<void> {
  await db.doctorAvailabilityOverrides.put({
    id: newId("ov"),
    ...input,
  });
}

export async function addWalkInAppointment(input: {
  doctorId: string;
  patientName: string;
  timeText: string;
}): Promise<void> {
  const today = startOfDay(Date.now());
  await addDoctorBooking({
    patientName: input.patientName,
    doctorId: input.doctorId,
    dateEpoch: today,
    timeText: input.timeText,
  });
}

function startOfDay(epoch: number): number {
  const d = new Date(epoch);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfToday(): number {
  return startOfDay(Date.now());
}
