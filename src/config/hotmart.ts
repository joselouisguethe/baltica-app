// ─────────────────────────────────────────────────────────────────────────────
// Hotmart checkout links — SINGLE SOURCE OF TRUTH for both landing pages.
//
// The offer codes below are already filled in. The ONLY value still missing is the
// product's alphanumeric HotLink code (PRODUCT_CODE) — it is NOT the numeric id
// 7769917. Find it inside any offer's link:
//   Hotmart → Producto → Ofertas → ⋮ → "Links de esta oferta"
//   the link looks like  https://pay.hotmart.com/<PRODUCT_CODE>?off=w32kp5a7
//   → copy the <PRODUCT_CODE> part and paste it below (or set VITE_HOTMART_PRODUCT_CODE).
//
// Until PRODUCT_CODE is set, the links still contain "REEMPLAZAR"; clicking a plan is
// then blocked client-side (see getCheckoutUrl) so users never land on Hotmart's
// "offer not found" (error 008) page. Full guide: ../../HOTMART_SETUP.md
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER = 'REEMPLAZAR';

const ENV = import.meta.env;

// Product HotLink code (alphanumeric, e.g. "J93420895K"). PASTE IT HERE ▼
const PRODUCT_CODE = ENV.VITE_HOTMART_PRODUCT_CODE || 'REEMPLAZAR';

// Offer codes from Hotmart → Producto → Ofertas (already configured).
const OFFER = {
  basico:     ENV.VITE_HOTMART_OFFER_BASICO     || 'w32kp5a7',
  intermedio: ENV.VITE_HOTMART_OFFER_INTERMEDIO || 'd67r8at1',
  premium:    ENV.VITE_HOTMART_OFFER_PREMIUM    || '8wk6nu6z',
};

// Base per-offer payment links (no tracking params — added per channel below).
export const HOTMART_CHECKOUT: Record<string, string> = {
  basico:     `https://pay.hotmart.com/${PRODUCT_CODE}?off=${OFFER.basico}`,
  intermedio: `https://pay.hotmart.com/${PRODUCT_CODE}?off=${OFFER.intermedio}`,
  premium:    `https://pay.hotmart.com/${PRODUCT_CODE}?off=${OFFER.premium}`,
};

// True once PRODUCT_CODE has been replaced with the real Hotmart product code.
export function isHotmartConfigured(planId: string): boolean {
  const url = HOTMART_CHECKOUT[planId];
  return !!url && !url.includes(PLACEHOLDER);
}

/**
 * Returns a ready-to-open checkout URL for the plan, with the channel's `sck`
 * tracking appended, or `null` if the link is not configured yet.
 * The link already carries `?off=...`, so `sck` is appended with `&`
 * (a URL must never contain two `?`).
 */
export function getCheckoutUrl(planId: string, sck?: string): string | null {
  const url = HOTMART_CHECKOUT[planId];
  if (!url || url.includes(PLACEHOLDER)) return null;
  if (!sck) return url;
  return url.includes('?') ? `${url}&sck=${encodeURIComponent(sck)}` : `${url}?sck=${encodeURIComponent(sck)}`;
}
