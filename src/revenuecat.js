import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';

const ENTITLEMENT_ID = (import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || 'beaconlift_plus').trim();
const IOS_API_KEY = (import.meta.env.VITE_REVENUECAT_API_KEY_IOS || '').trim();
const ANDROID_API_KEY = (import.meta.env.VITE_REVENUECAT_API_KEY_ANDROID || '').trim();
// Generic fallback key (useful during testing before platform keys are issued)
const FALLBACK_API_KEY = (import.meta.env.VITE_REVENUECAT_API_KEY || '').trim();

let configured = false;
let customerInfoListenerId = null;

export function isNativeRuntime() {
  return Capacitor.getPlatform() !== 'web';
}

function getPlatformApiKey() {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return IOS_API_KEY || FALLBACK_API_KEY;
  if (platform === 'android') return ANDROID_API_KEY || FALLBACK_API_KEY;
  return FALLBACK_API_KEY;
}

function hasPlusEntitlement(customerInfo) {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
}

export async function configureRevenueCat(userId) {
  if (!isNativeRuntime()) return false;
  const apiKey = getPlatformApiKey();
  if (!apiKey) {
    console.warn('RevenueCat API key missing. Set VITE_REVENUECAT_API_KEY_IOS / VITE_REVENUECAT_API_KEY_ANDROID.');
    return false;
  }

  if (!configured) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey, appUserID: userId || null });
    configured = true;
  } else if (userId) {
    await Purchases.logIn({ appUserID: userId });
  }
  return true;
}

export async function syncRevenueCatPlus(userId, onCustomerInfo) {
  const ready = await configureRevenueCat(userId);
  if (!ready) return false;

  if (!customerInfoListenerId) {
    customerInfoListenerId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      onCustomerInfo?.(customerInfo, hasPlusEntitlement(customerInfo));
    });
  }

  const { customerInfo } = await Purchases.getCustomerInfo();
  onCustomerInfo?.(customerInfo, hasPlusEntitlement(customerInfo));
  return hasPlusEntitlement(customerInfo);
}

export async function presentPlusPaywall() {
  const ready = await configureRevenueCat(null);
  if (!ready) throw new Error('RevenueCat is not configured for this platform.');
  return RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: ENTITLEMENT_ID,
  });
}

export async function presentCustomerCenter() {
  const ready = await configureRevenueCat(null);
  if (!ready) throw new Error('RevenueCat is not configured for this platform.');
  await RevenueCatUI.presentCustomerCenter();
}

export async function restorePurchases() {
  const ready = await configureRevenueCat(null);
  if (!ready) throw new Error('RevenueCat is not configured for this platform.');
  const { customerInfo } = await Purchases.restorePurchases();
  return { customerInfo, isPlus: hasPlusEntitlement(customerInfo) };
}

export async function getSubscriptionInfo() {
  const ready = await configureRevenueCat(null);
  if (!ready) return null;
  const { customerInfo } = await Purchases.getCustomerInfo();
  const entitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
  if (!entitlement) return null;
  return {
    isPlus: true,
    productId: entitlement.productIdentifier ?? null,
    expirationDate: entitlement.expirationDate ?? null,   // null for lifetime
    periodType: entitlement.periodType ?? 'normal',        // 'normal' | 'trial' | 'intro'
    store: entitlement.store ?? null,
  };
}

