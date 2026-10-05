export const CERTIFICATE_FEE = 100;
export const CERTIFICATE_FEE_CURRENCY = 'INR';
export const CERTIFICATE_UPI_ID = 'fizalabbas@sbi';
export const CERTIFICATE_QR_SRC = '/payment/certificate-upi-qr-official.jpeg';

// Registration window for the payment-exempt batch (inclusive start, exclusive end).
export const SEPTEMBER_EXEMPT_START = '2026-09-01T00:00:00.000Z';
export const SEPTEMBER_EXEMPT_END = '2026-10-01T00:00:00.000Z';
export const SEPTEMBER_EXEMPT_NOTICE =
  'SEPTEMBER REGISTERED STUDENTS BATCH DOESN\u2019T HAVE TO PAY FOR THE CERTIFICATE.';

export function isSeptember2026Exempt(registeredAt: string | null | undefined): boolean {
  if (!registeredAt) return false;
  const t = new Date(registeredAt).getTime();
  if (Number.isNaN(t)) return false;
  return t >= Date.parse(SEPTEMBER_EXEMPT_START) && t < Date.parse(SEPTEMBER_EXEMPT_END);
}