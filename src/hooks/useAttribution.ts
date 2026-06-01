import { useEffect } from 'react';

// Marketing attribution captured from the landing URL and persisted so it
// survives the gap between landing and account creation (signup).
// See docs/dual-channel-sales-plan.md.

const STORAGE_KEY = 'baltica_attribution';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_referrer?: string;
}

export function getAttribution(): Attribution {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

// Read utm_* params from the current URL and store them (first-touch: only
// write if we don't already have attribution stored).
export function captureAttribution() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return; // first-touch wins
    const params = new URLSearchParams(window.location.search);
    const data: Attribution = {};
    const src = params.get('utm_source');
    const med = params.get('utm_medium');
    const camp = params.get('utm_campaign');
    if (src) data.utm_source = src.slice(0, 100);
    if (med) data.utm_medium = med.slice(0, 100);
    if (camp) data.utm_campaign = camp.slice(0, 100);
    if (document.referrer) data.landing_referrer = document.referrer.slice(0, 2000);
    if (Object.keys(data).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    /* localStorage unavailable — ignore */
  }
}

// Hook form: captures attribution once on mount. Use on the landing page.
export function useAttribution() {
  useEffect(() => {
    captureAttribution();
  }, []);
}
