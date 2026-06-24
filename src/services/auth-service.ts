import { db } from "@/db/database";
import { verifySecret } from "@/services/password-hasher";
import type { RoleType } from "@/types/billing";
import type { AppRole } from "@/components/ayura/RoleBadge";

export function appRoleToRoleType(role: AppRole): RoleType {
  switch (role) {
    case "front-desk":
      return "FRONT_DESK";
    case "doctor":
      return "DOCTOR";
    case "admin":
      return "ADMIN";
  }
}

export function roleTypeToAppRole(role: RoleType): AppRole {
  switch (role) {
    case "FRONT_DESK":
      return "front-desk";
    case "DOCTOR":
      return "doctor";
    case "ADMIN":
      return "admin";
  }
}

export async function verifyRoleCredential(role: AppRole, secret: string): Promise<boolean> {
  const settings = await db.clinicSettings.get("default");
  if (!settings) return false;

  switch (role) {
    case "front-desk":
      return verifySecret(secret, settings.frontDeskPinHash);
    case "admin":
      return verifySecret(secret, settings.adminPasswordHash);
    case "doctor": {
      const doctors = await db.doctors.filter((d) => d.active).toArray();
      for (const doctor of doctors) {
        if (await verifySecret(secret, doctor.pinHash)) return true;
      }
      return false;
    }
    default:
      return false;
  }
}

export async function updateFrontDeskPin(currentPin: string, newPin: string): Promise<void> {
  const settings = await db.clinicSettings.get("default");
  if (!settings) throw new Error("Clinic not configured");
  const valid = await verifySecret(currentPin, settings.frontDeskPinHash);
  if (!valid) throw new Error("Current PIN is incorrect");
  if (newPin.length < 4) throw new Error("PIN must be at least 4 digits");
  const { hashSecret } = await import("@/services/password-hasher");
  await db.clinicSettings.update("default", {
    frontDeskPinHash: await hashSecret(newPin),
  });
}

export async function updateAdminPassword(current: string, next: string): Promise<void> {
  const settings = await db.clinicSettings.get("default");
  if (!settings) throw new Error("Clinic not configured");
  const valid = await verifySecret(current, settings.adminPasswordHash);
  if (!valid) throw new Error("Current password is incorrect");
  if (next.length < 8) throw new Error("Password must be at least 8 characters");
  const { hashSecret } = await import("@/services/password-hasher");
  await db.clinicSettings.update("default", {
    adminPasswordHash: await hashSecret(next),
  });
}
