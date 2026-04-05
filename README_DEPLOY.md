# 🚀 How to Publish FORGE (Phase 1: Web Beta)

Your app is now a **Progressive Web App (PWA)**! This means users can "Install" it on their phones via Safari or Chrome.

Follow these 3 simple steps to get your live URL:

## 1. Push your code to GitHub
If you haven't already, create a new repository on GitHub and push your local code there:
```bash
git init
git add .
git commit -m "Initial commit - PWA ready"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. Connect to Vercel (Recommended)
1. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New" > "Project"**.
3. Import your **WorkoutTracker** repository.
4. Vercel will automatically detect **Vite**.
5. Click **"Deploy"**.

## 3. Launch & Install
Once the build is finished, Vercel will give you a URL (e.g., `forge-workout.vercel.app`).
- **On iPhone**: Open the URL in Safari, tap the **Share** button, and select **"Add to Home Screen"**.
- **On Android**: Open the URL in Chrome, tap the **three dots**, and select **"Install App"**.

---

### Pro-Tip: Custom Domain
If you want to look super professional, you can buy a domain like `forgetracker.app` inside Vercel for about $12/year.

**Need help with the GitHub steps? Let me know!**
