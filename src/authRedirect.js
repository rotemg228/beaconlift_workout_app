/**
 * OAuth / email-confirm return URL. Must appear in Supabase:
 * Authentication → URL Configuration → Redirect URLs.
 *
 * Set VITE_AUTH_REDIRECT_URL on Vercel to your production origin only if needed
 * (e.g. https://your-app.vercel.app). Never set it to localhost on Vercel.
 */
export function getAuthRedirectUrl() {
  const pageOrigin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';

  const explicit = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (explicit && /^https?:\/\//i.test(explicit)) {
    const clean = explicit.replace(/\/$/, '');
    const explicitIsLocal = /localhost|127\.0\.0\.1/i.test(clean);
    const pageIsHttpsProd =
      pageOrigin.startsWith('https://') && !/localhost|127\.0\.0\.1/i.test(pageOrigin);
    // Avoid a mistaken Vercel env (localhost) forcing OAuth back to your PC
    if (explicitIsLocal && pageIsHttpsProd) {
      return pageOrigin;
    }
    return clean;
  }

  return pageOrigin;
}
