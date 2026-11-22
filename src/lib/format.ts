export function formatBND(amount: number): string {
  return `BND ${amount.toFixed(2)}`;
}

export function makeOrderRef(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DG-${ref}`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
