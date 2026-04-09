# BeaconLift — Publish by end of April (checklist)

You can ignore hosting drama for now. When you’re ready to ship, work through this in order. Goal: **one GitHub user, one Vercel account, clean commits, working production build, secure Plus checkout.**

---

## Before you start (mindset)

- **Git push ≠ deploy.** GitHub only stores commits. **Vercel** (or another host) runs **install → build → deploy** separately.
- **Commit author matters on Vercel Hobby + private repos.** The email on each commit must match a **verified email** on the GitHub account that owns the project, or deploys can be **blocked** even if you “own” everything.

---

## 1) Pick your identities (do this once)

1. Choose **one GitHub account** you’ll keep for this app (e.g. personal, not a random alt).
2. Choose **one Vercel account** logged in with **that same GitHub** (or link GitHub after signup).
3. Optional later: cheap domain (often **~$1–12/year** on promos for `.xyz` etc.) — not required to launch; you can use `*.vercel.app` first.

---

## 2) New / clean GitHub repo

1. Create repo under that account, e.g. `beaconlift_workout_app` (name up to you).
2. **Private vs public:** On **Vercel Hobby**, private repos + wrong commit author often trigger “no access / collaboration” blocks. If you’re solo and ok with it, **public** avoids a class of pain; if **private**, you **must** fix commit email (step 5).
3. Push this project’s code:

   ```bash
   cd /path/to/WorkoutTracker
   git remote set-url origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

   Use `main` or `master` consistently everywhere below.

---

## 3) New Vercel project

1. Sign up / log in to **Vercel** with the **same** GitHub user.
2. **Add New → Project** → Import **that** repo.
3. Preset: **Vite** (or let auto-detect). Build: `npm run build`, output: `dist` (already in `vercel.json`).
4. **Settings → Git → Production Branch** = the branch you push (`main` or `master`).
5. **Settings → General → Node.js** = **20.x** (project already has `engines.node`).

---

## 4) Environment variables (Vercel)

**Project → Settings → Environment Variables** — add for **Production** (and Preview if you want).

| Name | Purpose |
|------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL (browser) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (browser) |
| `SUPABASE_URL` | Same URL; for serverless API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — server only; updates `profiles` after payment |
| `STRIPE_SECRET_KEY` | Stripe secret key (server) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for webhook endpoint |

After saving: **Redeploy** (or push a commit) so a new build picks them up.

**Local:** keep a `.env` for dev; **never** commit it (it’s in `.gitignore`).

---

## 5) Git author = GitHub you (fixes “commit author has no access”)

On your machine, in the repo:

```bash
git config user.name "Your Name"
git config user.email "your-verified-email@example.com"
```

Use an email listed under **GitHub → Settings → Emails** (verified). Or GitHub’s **noreply** address if you use that.

If past commits have the wrong author, fix the **latest** commit and force-push once:

```bash
git commit --amend --reset-author --no-edit
git push --force-with-lease
```

---

## 6) Git credentials (when `git` and `gh` disagree)

```bash
gh auth login          # log in as the right GitHub user
gh auth setup-git      # make git use gh’s token for HTTPS
```

Remove stale **Windows Credential Manager** entries for `git:https://github.com` if pushes still use the wrong account.

---

## 7) Stripe (secure Plus checkout)

1. **Stripe Dashboard → Developers → API keys** — use **secret** key in `STRIPE_SECRET_KEY`.
2. **Developers → Webhooks → Add endpoint**  
   URL: `https://YOUR-VERCEL-URL.vercel.app/api/stripe-webhook`  
   Events (minimum): `checkout.session.completed`, `customer.subscription.deleted`
3. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel.
4. In the app, Plus checkout is created via `POST /api/create-checkout-session` (server-side).

Apple Pay / Google Pay / Card show in **Stripe Checkout** when enabled for your account and supported in the customer’s browser; PayPal only if you enable it in Stripe and pass `paypal` in payment methods (already wired in API).

---

## 8) Supabase (auth + DB)

1. Run SQL migration in Supabase SQL editor: `supabase/migrations/2026-04-07_profiles_plus_auth.sql` (if not already).
2. **Auth → URL configuration:** Site URL + redirect URLs include your **production** URL and `http://localhost:5173` for dev.
3. **Auth → Providers:** Email (confirm email on), Google OAuth, etc.
4. Row Level Security on `profiles` / app tables as already designed.

---

## 9) “Done” definition by end of April

- [ ] Production URL loads the **BeaconLift** app (not old Forge branding).
- [ ] Sign up / sign in / Google (and guest) behave as you want.
- [ ] Plus: checkout opens, payment completes, **webhook** sets `profiles` to Plus (not only client-side).
- [ ] Env vars set on Vercel; no secrets in the repo.
- [ ] Optional: custom domain DNS → Vercel (when you buy one).

---

## 10) If you skip Vercel later

Same app can go to **Netlify** or **Cloudflare Pages** with adapters for serverless; that’s a small migration — come back to this file and replace section 3 only.

---

Good luck with the other projects — this list will still be here when you pick up BeaconLift again.
