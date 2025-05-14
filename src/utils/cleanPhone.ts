export function cleanPhoneNumber(input: string): string {
  // Remove spaces, dashes, and plus signs
  const normalized = input.replace(/[\s\-+]/g, "");

  // Match formats starting with 07 or 011
  if (/^07\d{8}$/.test(normalized)) {
    return "254" + normalized.slice(1); // Replace leading 0 with 254
  }

  if (/^01[0-1]\d{7}$/.test(normalized)) {
    return "254" + normalized.slice(1);
  }

  // Already starts with 254 and is valid
  if (/^254(7\d{8}|1[0-1]\d{7})$/.test(normalized)) {
    return normalized;
  }

  throw new Error("Invalid phone number format for M-Pesa.");
}
