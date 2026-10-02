/**
 * Global Contact & Dealership Configuration
 * Configurable via NEXT_PUBLIC_WHATSAPP_NUMBER environment variable.
 */

// Primary WhatsApp number (defaults to user-specified test number 9981462313)
export const DEFAULT_WHATSAPP_NUMBER = "9981462313";

/**
 * Returns formatted WhatsApp number for wa.me links
 * e.g., "9981462313" -> "919981462313"
 */
export function getWhatsAppNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    DEFAULT_WHATSAPP_NUMBER;
  const cleaned = raw.replace(/\D/g, "");
  // If 10 digits (standard Indian mobile), prepend 91 for international wa.me standard
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Returns formatted display phone number
 * e.g., "+91 99814 62313"
 */
export function getDisplayPhone(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    DEFAULT_WHATSAPP_NUMBER;
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    const local = cleaned.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return raw;
}

/**
 * Builds a valid wa.me URL with optional pre-filled message text
 */
export function buildWhatsAppUrl(message?: string): string {
  const number = getWhatsAppNumber();
  if (!message) {
    return `https://wa.me/${number}`;
  }
  // Safeguard: decode first if caller accidentally passed an already encoded string
  let cleanMessage = message;
  try {
    if (message.includes("%")) {
      cleanMessage = decodeURIComponent(message);
    }
  } catch {
    cleanMessage = message;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(cleanMessage)}`;
}

