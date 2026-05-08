import { Purchases, LogLevel, ErrorCode } from '@revenuecat/purchases-js';

const ENTITLEMENT_ID = (import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || 'beaconlift_plus').trim();
/** Public API key from RevenueCat → Web Billing app (not the iOS/Android SDK keys). */
const WEB_API_KEY = (
  import.meta.env.VITE_REVENUECAT_WEB_BILLING_API_KEY ||
  import.meta.env.VITE_REVENUECAT_WEB_API_KEY ||
  ''
).trim();

let purchasesInstance = null;
let configuredUserId = null;

export { ErrorCode };

export function isWebBillingConfigured() {
  return !!WEB_API_KEY;
}

function hasPlusEntitlement(customerInfo) {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
}

/**
 * Configure or reuse Web SDK; keeps appUserId in sync with Supabase user id.
 */
export async function ensureWebPurchases(userId) {
  if (!WEB_API_KEY || !userId) return null;

  if (!purchasesInstance) {
    Purchases.setLogLevel(import.meta.env.DEV ? LogLevel.Debug : LogLevel.Warn);
    purchasesInstance = await Purchases.configure({ apiKey: WEB_API_KEY, appUserId: userId });
    configuredUserId = userId;
  } else if (configuredUserId !== userId) {
    await purchasesInstance.changeUser(userId);
    configuredUserId = userId;
  }
  return purchasesInstance;
}

export async function syncRevenueCatWebPlus(userId, onCustomerInfo) {
  const p = await ensureWebPurchases(userId);
  if (!p) return false;
  const customerInfo = await p.getCustomerInfo();
  const isPlus = hasPlusEntitlement(customerInfo);
  onCustomerInfo?.(customerInfo, isPlus);
  return isPlus;
}

/**
 * RevenueCat-hosted paywall + checkout (Stripe under the hood for Web Billing).
 */
export async function presentWebPlusPaywall({ userId, customerEmail, htmlTarget } = {}) {
  const p = await ensureWebPurchases(userId);
  if (!p) {
    throw new Error(
      'RevenueCat Web Billing is not configured. Set VITE_REVENUECAT_WEB_BILLING_API_KEY in your environment.',
    );
  }
  return p.presentPaywall({
    htmlTarget: htmlTarget ?? undefined,
    customerEmail: customerEmail || undefined,
  });
}
