/**
 * Social Media and URL formatting helpers with strict XSS / javascript: protocol safety.
 */

export function sanitizeUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return null;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function formatWhatsAppUrl(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.toLowerCase().startsWith('javascript:')) return null;

  // If already a full wa.me or whatsapp.com URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return sanitizeUrl(trimmed);
  }

  // Strip non-digits
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return null;

  // If 10 digits (common Indian mobile number), prepend 91 country code
  const formattedDigits = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  return `https://wa.me/${formattedDigits}`;
}

export function formatInstagramUrl(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.toLowerCase().startsWith('javascript:')) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return sanitizeUrl(trimmed);
  }

  const handle = trimmed.replace(/^@/, '').trim();
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}

export function formatFacebookUrl(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.toLowerCase().startsWith('javascript:')) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return sanitizeUrl(trimmed);
  }

  const page = trimmed.replace(/^@/, '').trim();
  if (!page) return null;
  return `https://facebook.com/${page}`;
}

export function formatWebsiteUrl(input?: string | null): string | null {
  return sanitizeUrl(input);
}
