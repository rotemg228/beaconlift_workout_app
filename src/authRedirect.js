/**
 * OAuth / magic-link return URL. Must be listed in Supabase:
 * Authentication → URL Configuration → Redirect URLs.
 * Optional VITE_AUTH_REDIRECT_URL on Vercel if previews use varying origins (set to production URL).
 */
export function getAuthRedirectUrl() {
  const explicit = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (explicit && /^https?:\/\//i.test(explicit)) {
    return explicit.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
