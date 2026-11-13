/**
 * Removes obvious personal data from a free-text description before it leaves
 * the device for AI extraction. This is a best-effort filter for common
 * patterns, not a guarantee that no personal data remains.
 */
export const REDACTED = "[removed]";

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Phone numbers: optional +country code, then 10+ digits that may be split by
// spaces, dots, dashes or brackets (e.g. +91 98765 43210, (0135) 271-2345).
const PHONE = /(?:\+|\()?\d[\d\s().-]{8,}\d/g;
// Any remaining run of 7+ digits (ID, account or Aadhaar-like numbers).
// Short numbers such as "km 42" or "NH-58" are kept.
const LONG_DIGITS = /\d{7,}/g;

export function sanitizeDescription(text: string): string {
  return text
    .replace(EMAIL, REDACTED)
    .replace(PHONE, (match) =>
      // Only treat it as a phone number if it has at least 10 digits.
      match.replace(/\D/g, "").length >= 10 ? REDACTED : match,
    )
    .replace(LONG_DIGITS, REDACTED);
}
