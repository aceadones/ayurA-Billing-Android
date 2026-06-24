export function newId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

export function newInvoiceId(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${n}`;
}
