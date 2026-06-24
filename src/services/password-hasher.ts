import bcrypt from "bcryptjs";

const COST = 12;

export async function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, COST);
}

export async function verifySecret(raw: string, encoded: string): Promise<boolean> {
  if (!encoded) return false;
  return bcrypt.compare(raw, encoded);
}
