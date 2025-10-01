# Deployment Guide

## 🚨 Current Issue: Clerk API Keys Required

The Vercel build is failing because Clerk requires valid API keys at build time.

### Quick Fix Steps

#### 1. Get Your Clerk API Keys

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in or create an account
3. Create a new application (or select existing)
4. Go to **API Keys** section
5. Copy both keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

#### 2. Update Local Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_HERE
```

#### 3. Add Keys to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY = sk_test_YOUR_ACTUAL_SECRET_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
DATABASE_URL = file:./dev.db
```

4. Click **Save**

#### 4. Redeploy on Vercel

Option A - Trigger redeploy from Vercel dashboard:

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**

Option B - Push a new commit:

```bash
git commit --allow-empty -m "chore: trigger redeploy with Clerk keys"
git push
```

---

## 📋 All Required Environment Variables

### Production (.env in Vercel)

```env
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (for production, use PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Development (.env.local)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_dev_key
CLERK_SECRET_KEY=sk_test_your_dev_secret

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL="file:./dev.db"
```

---

## 🔧 Vercel Build Configuration

### Build Settings

In Vercel project settings:

**Build & Development Settings:**

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (or keep default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm ci`

**Root Directory:** `./` (default)

### Recommended Settings

1. **Ignored Build Step:** Leave blank (build on every push)
2. **Node.js Version:** 20.x (automatic)
3. **Function Region:** Choose closest to your users

---

## 🗄️ Database for Production

### Option 1: Vercel Postgres (Recommended)

1. Go to **Storage** tab in Vercel
2. Click **Create Database**
3. Select **Postgres**
4. Vercel will automatically add `DATABASE_URL` to your environment variables

Then update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "chore: add prisma migrations"
git push
```

### Option 2: Supabase

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get the connection string from **Settings** → **Database**
3. Add to Vercel environment variables:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Option 3: PlanetScale

1. Create a PlanetScale database at [https://planetscale.com](https://planetscale.com)
2. Get the connection string
3. Add to Vercel environment variables

---

## ⚡ Quick Start Checklist

- [ ] Get Clerk API keys from [dashboard.clerk.com](https://dashboard.clerk.com)
- [ ] Add keys to `.env.local` locally
- [ ] Add keys to Vercel environment variables
- [ ] Test build locally: `npm run build:ci`
- [ ] Push to trigger Vercel deployment
- [ ] Verify deployment succeeds
- [ ] (Optional) Set up production database
- [ ] (Optional) Run database migrations

---

## 🐛 Troubleshooting

### Build Fails with "Invalid publishableKey"

**Problem:** Clerk keys are not set or are still placeholders.

**Solution:**

1. Get real Clerk keys from [dashboard.clerk.com](https://dashboard.clerk.com)
2. Add them to Vercel environment variables
3. Redeploy

### Build Fails with "DATABASE_URL not found"

**Problem:** Database URL not set in Vercel.

**Solution:**

1. Add `DATABASE_URL` to Vercel environment variables
2. For production, use PostgreSQL (not SQLite)
3. Redeploy

### Husky Hooks Failing

**Problem:** Husky deprecated shebang lines.

**Solution:** Already fixed! The old shebang lines have been removed.

### Pre-push Hook Takes Too Long

**Problem:** `build:ci` runs full build before every push.

**Solution (if needed):**

```bash
# Temporarily skip
git push --no-verify

# Or disable pre-push hook
chmod -x .husky/pre-push
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - it's gitignored
2. **Keep `.env.example` updated** - for team onboarding
3. **Use test keys** in development (`pk_test_`, `sk_test_`)
4. **Use live keys** in production (`pk_live_`, `sk_live_`)
5. **Rotate keys** if accidentally exposed

---

## 📊 Post-Deployment

After successful deployment:

1. **Test authentication:**
   - Visit your deployed URL
   - Click "Sign In"
   - Create a test account
   - Verify redirect to dashboard

2. **Test API endpoints:**
   - `/api/health` - Should return `{ status: "ok" }`
   - `/api/export` (GET) - Should return quota info
   - `/api/export` (POST) - Should generate PDFs (once Clerk is set up)

3. **Monitor:**
   - Check Vercel deployment logs
   - Monitor function execution times
   - Watch for errors in Vercel dashboard

---

## 🎯 Next Steps

1. Add real Clerk keys ← **Do this first!**
2. Set up production database (PostgreSQL)
3. Configure Supabase Storage for PDFs
4. Add Stripe for subscription management
5. Set up monitoring (Sentry, LogRocket, etc.)
6. Configure custom domain
7. Set up CI/CD notifications (Slack, Discord)

---

## 🚀 Production Checklist

Before going live:

- [ ] Real Clerk keys configured
- [ ] Production database set up
- [ ] Environment variables all set in Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Terms of Service & Privacy Policy added

---

## 📞 Support

If you continue having issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test build locally first: `npm run build:ci`
4. Check Clerk dashboard for any issues
5. Review error messages in Vercel logs

**Common Issues:**

- Missing environment variables
- Invalid API keys
- Database connection errors
- TypeScript compilation errors
- Missing dependencies

Most issues can be resolved by ensuring all environment variables match between local and Vercel.
