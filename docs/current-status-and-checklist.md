# BeaconLift — where the repo is + what to do next

Last reviewed: 2026-04-18.

## Run locally

```powershell
cd C:\Users\User\Documents\Projects\WorkoutTracker
npm install   # if needed
npm run dev
```

Open **http://localhost:5173/**

**Note:** Plus checkout calls **`POST /api/create-checkout-session`**. That route exists for **Vercel serverless**, not for plain `vite` dev. To test checkout locally use **`vercel dev`** (with env vars), or test checkout on the deployed preview/production URL.

---

## Naming: “Pro” in code vs “Plus” in the UI

- Users see **BeaconLift Plus** (modal, profile upsell).
- The Zustand flag is still **`profile.isPro`**: it means **paid / Plus tier** (loaded from Supabase `profiles.is_plus` or `is_pro`).
- There is **no separate “Pro + Plus”** product in this codebase—**one paid tier**.

---

## What Plus is supposed to include (marketing copy in `ProModal.jsx`)

1. **Cloud sync** — *copy says* cross-device sync.
2. **Unlimited templates** — custom routines without the free cap.
3. **Advanced analytics** — *copy says* volume trends and muscle split charts.
4. **Verified profile** — Plus badge on profile.

---

## What is actually enforced in code today

| Area | Free | Plus (`profile.isPro`) |
|------|------|-------------------------|
| **Custom templates** | Max **3** custom templates; going over opens the Plus modal | Unlimited (`canAddTemplate` in `store/index.js`) |
| **Dashboard / workout picker** | Shows **x/3** usage | No cap badge |
| **Profile** | Plus upsell card | Crown / badge-style UI blocks |
| **Progress (charts)** | **Not gated** — charts available to everyone | Same |
| **Cloud sync (workouts/templates to Supabase)** | **Any logged-in user** syncs when `user` is set — **not** restricted by Plus today | Same |

So: **template limits + profile upsell** match the paywall; **“advanced analytics” and “cloud sync only for Plus” are not fully aligned** with the implementation yet—good candidates for a future pass if you want the product to match the pitch.

---

## Checkout & Stripe (current behavior)

- **Price:** **$1.99/month** USD (`unit_amount: 199` in `api/create-checkout-session.js`).
- **Trial:** **14 days** (`trial_period_days: 14`).
- **Flow:** Signed-in user → modal → `fetch('/api/create-checkout-session', …)` → redirect to **Stripe Checkout** → success → `/profile?checkout=success`.
- **Webhook:** `api/stripe-webhook.js` on `checkout.session.completed` sets `profiles` to Plus; `customer.subscription.deleted` sets back to free.
- **PayPal:** Only when user picks PayPal in the modal; API uses `payment_method_types: ['paypal','card']` for that path.

**Production hardening to verify:** Webhook signature needs the **raw** request body on Vercel. If webhooks return 400, the handler may need the Vercel/raw-body pattern for Stripe.

---

## New Vercel account — what *you* must do (I can’t log in as you)

I **cannot** create a Vercel account, link GitHub, or click “Import project” in your browser. You:

1. Sign up / log in to Vercel (new account is fine).
2. **Import** this repo (same GitHub repo after you push).
3. Set **Environment variables** (see `docs/publish-by-end-of-april.md` table).
4. **Redeploy** after env changes.
5. In **Stripe**, add webhook URL: `https://<your-project>.vercel.app/api/stripe-webhook` and paste signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.
6. In **Supabase → Auth → URL configuration**, add the new production URL (and keep localhost for dev).

I *can* help in-repo: fix build errors, webhook handler, env documentation, `vercel.json`, etc.—after you connect the account.

---

## Checklist — “what has to be done now”

Use this in order when you’re ready to ship under the new name/site.

- [ ] **Git:** `git remote` points at the repo you want; commit author email = **verified** GitHub email (see `publish-by-end-of-april.md`).
- [ ] **Vercel:** New project, import repo, Node 20, build `npm run build`, output `dist`.
- [ ] **Env on Vercel:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- [ ] **Stripe:** Live (or test) keys; webhook endpoint + events; **Customer portal** / cancel flow if you want self-serve cancel (optional).
- [ ] **Supabase:** Migrations applied; **Site URL** + redirect URLs include new Vercel domain; Google OAuth redirect URIs updated.
- [ ] **Smoke test:** Sign up → verify email (if required) → log in → start workout → **Plus** → complete **test** checkout → confirm `profiles` updates (or webhook logs).
- [ ] **Decide:** Gate **Progress** (or parts of it) behind Plus? Gate **cloud sync** so only Plus users sync to Supabase? (Product decision + code changes.)
- [ ] **Optional:** Custom domain in Vercel + DNS; update Supabase/Stripe URLs again.

---

## Quick links in this repo

- Full deploy steps: `docs/publish-by-end-of-april.md`
- API: `api/create-checkout-session.js`, `api/stripe-webhook.js`
- Plus UI: `src/components/ProModal.jsx`
- Plan flag: `src/store/index.js` (`syncProfile`, `canAddTemplate`)
