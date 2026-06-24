export type BillItemType = "MEDICINE" | "TREATMENT" | "CONSULTATION";

export type InvoiceStatus = "ACTIVE" | "CANCELLED";

export type SyncStatus = "PENDING" | "FAILED" | "SYNCED";

export type SyncOperation = "CREATE" | "UPDATE" | "DELETE";

export type RoleType = "FRONT_DESK" | "DOCTOR" | "ADMIN";

export interface BillItemInput {
  id: string;
  type: BillItemType;
  title: string;
  qty: number;
  unitPrice: number;
  taxPercent: number;
  discount?: number;
}

export interface Totals {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paid: number;
  balance: number;
}

export interface PaymentInput {
  method: string;
  amount: number;
  referenceNote?: string;
}

export interface InvoiceDraft {
  invoiceId: string;
  patientName: string;
  patientPhone?: string;
  pharmacistId: string;
  items: BillItemInput[];
  payments: PaymentInput[];
  totals: Totals;
  createdAt: number;
}

export interface OnboardingDraft {
  clinicName: string;
  address: string;
  phone: string;
  deviceKey: string;
  adminPassword: string;
  frontDeskPin: string;
  doctorName: string;
  doctorPin: string;
  pharmacistName: string;
  slotDuration: string;
  stockThreshold: string;
  expiryWindow: string;
}

export interface ClinicSettings {
  id: string;
  clinicName: string;
  address: string;
  phone: string;
  logoUri?: string;
  slotDurationMinutes: number;
  stockThresholdDefault: number;
  expiryAlertDays: number;
  deviceAuthorized: boolean;
  deviceToken?: string;
  adminPasswordHash: string;
  frontDeskPinHash: string;
  onboardingComplete: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  batchNo?: string;
  stockQty: number;
  unitPrice: number;
  taxPercent: number;
  expiryDate?: number;
  minThreshold: number;
  updatedAt: number;
}

export interface Treatment {
  id: string;
  name: string;
  fee: number;
  slotCapacity: number;
  active: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  pinHash: string;
  specialization?: string;
  active: boolean;
}

export interface Pharmacist {
  id: string;
  name: string;
  active: boolean;
}

export interface InvoiceRecord {
  id: string;
  patientName: string;
  patientPhone?: string;
  pharmacistId: string;
  consultationItemId?: string;
  subtotal: number;
  discount: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  cancelledAt?: number;
  createdAt: number;
  updatedAt: number;
  isSynced: boolean;
}

export interface InvoiceItemRecord {
  id: string;
  invoiceId: string;
  type: BillItemType;
  medicineId?: string;
  treatmentId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountAmount: number;
  lineTotal: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  referenceNote?: string;
  paidAt: number;
}

export interface InvoiceWithDetails extends InvoiceRecord {
  items: InvoiceItemRecord[];
  payments: PaymentRecord[];
}

export interface TreatmentBooking {
  id: string;
  patientName: string;
  treatmentId: string;
  dateEpoch: number;
  slot: string;
  status: string;
}

export interface DoctorBooking {
  id: string;
  patientName: string;
  doctorId: string;
  dateEpoch: number;
  timeText: string;
  status: string;
}

export interface DoctorAvailabilityOverride {
  id: string;
  doctorId: string;
  dateEpoch: number;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface SyncQueueEntry {
  id: string;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payloadJson: string;
  priority: number;
  status: SyncStatus;
  retries: number;
  lastError?: string;
  updatedAt: number;
  createdAt: number;
}

export interface RoleSession {
  role: RoleType;
  unlocked: boolean;
  lastUnlockAt: number;
}
