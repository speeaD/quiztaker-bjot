export type Subscription = {
  accountType: "regular" | "premium";
  planId: string | null;
  planLevel: "lite" | "pro" | "pro-max" | null;
  expiresAt: string | null;
  hasProAccess: boolean;
};

export type PaymentPlan = {
  id: string;
  track: "Science" | "Art & Commercial";
  name: string;
  amount: number;
  currency: "NGN";
  months: number | null;
  level: "lite" | "pro" | "pro-max";
  available: boolean;
  expiresAt?: string | null;
};

// Only billing destinations are carried through sign-in; never allow external redirects.
export function billingReturn(value: string | null): string | null {
  if (!value || !/^\/billing(?:\/callback)?(?:\?|$)/.test(value) || /[\\\r\n]/.test(value)) return null;
  return value;
}

export function billingAuthLink(page: "login" | "register") {
  const next = billingReturn(new URLSearchParams(window.location.search).get("next"));
  return next ? `/${page}?next=${encodeURIComponent(next)}` : `/${page}`;
}

export function formatExpiry(value: string) {
  return new Date(new Date(value).getTime() - 1).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
}
