/**
 * Builds Gumroad checkout URL with beaconlift_user_id + email query params.
 * VITE_GUMROAD_CHECKOUT_URL must be the full product link (https://…gumroad.com/l/…).
 */
export function buildGumroadCheckoutUrl(base, { userId, email } = {}) {
  if (!base || typeof base !== 'string') return null;
  let raw = base.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }
  try {
    const u = new URL(raw);
    if (userId) u.searchParams.set('beaconlift_user_id', userId);
    if (email) u.searchParams.set('email', email);
    return u.toString();
  } catch {
    return null;
  }
}
