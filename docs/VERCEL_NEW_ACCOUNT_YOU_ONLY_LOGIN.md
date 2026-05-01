# New Vercel account — what only you can do vs what’s already done

## What’s already done (in the repo)

- **Build:** `npm run build` → output folder **`dist`** (see `vercel.json`).
- **Node:** `package.json` asks for **Node ≥ 20** (set **20.x** in Vercel if it asks).
- **API routes:** `api/create-checkout-session.js` and `api/stripe-webhook.js` deploy as Vercel serverless functions when this project is imported.

**I cannot:** open a browser, create your Vercel account, click “Import”, or paste secrets into Vercel for you. You do those steps once; after that we can fix code/config from the repo if something breaks.

---

## Your steps (new Vercel account)

1. **Sign up / log in** at [vercel.com](https://vercel.com) (new account is fine).
2. **Connect GitHub** when Vercel asks (OAuth in your browser).
3. **Add New → Project** → pick **this** repo → **Import**.
4. Leave **Framework Preset** as Vite (or auto-detect). **Build Command** `npm run build`, **Output** `dist` (should match `vercel.json`).
5. **Environment variables** — open **Settings → Environment Variables**, add the table below for **Production** (and Preview if you want previews to work). Use values from your `.env` / Stripe / Supabase dashboards — **never commit** those values.
6. **Deploy** (first deploy or **Redeploy** after saving env vars).
7. Copy your production URL, e.g. `https://something.vercel.app` — you’ll need it for Stripe webhook + Supabase auth URLs.

**Optional:** **Settings → General → Project Name** sets the friendly name; the default `*.vercel.app` hostname is tied to the project name when it’s created. New account + new project = fresh name.

---

## Environment variables to paste (names only — you supply values)

| Name | Where you get the value |
|------|-------------------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → **anon** `public` key |
| `SUPABASE_URL` | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **service_role** key (server only; never expose to client) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret** key |
| `STRIPE_WEBHOOK_SECRET` | After you add the webhook (below) |

---

## Right after first successful deploy

1. **Stripe** → Developers → Webhooks → Add endpoint  
   **URL:** `https://YOUR-PROJECT.vercel.app/api/stripe-webhook`  
   Events (minimum): `checkout.session.completed`, `customer.subscription.deleted`  
   Copy the **signing secret** → Vercel env `STRIPE_WEBHOOK_SECRET` → **Redeploy**.

2. **Supabase** → Authentication → URL configuration  
   Add your **production** URL to **Site URL** and **Redirect URLs** (keep `http://localhost:5173` for local dev).

3. **Google OAuth** (if you use it): add the production origin/redirect URLs Google and Supabase expect.

---

That’s the full “you only fill credentials” path. Ignore the old failed project; this flow is only for the new Vercel account + new import.
