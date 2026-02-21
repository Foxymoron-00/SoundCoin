# SoundCoin Deployment Guide

Complete step-by-step instructions to deploy the SoundCoin music streaming platform for **$0 monthly cost**.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Supabase Setup (Database)](#step-1-supabase-setup-database)
4. [Step 2: Cloudflare Setup (Backend + Frontend)](#step-2-cloudflare-setup-backend--frontend)
5. [Step 3: PayPal Setup (Payouts)](#step-3-paypal-setup-payouts)
6. [Step 4: Domain Setup (Optional)](#step-4-domain-setup-optional)
7. [Step 5: Environment Configuration](#step-5-environment-configuration)
8. [Step 6: Build and Deploy](#step-6-build-and-deploy)
9. [Admin Setup](#admin-setup)
10. [Monetization Setup](#monetization-setup)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES (Free Hosting)                 │
│                   Frontend (React App)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKERS (Free Tier)                  │
│              API Endpoints + Serverless Functions            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (Free Tier - 500MB)                    │
│     PostgreSQL Database + Auth + Storage + Realtime          │
└─────────────────────────────────────────────────────────────┘
```

**Free Tier Limits:**
- Cloudflare Pages: Unlimited requests, 500 builds/month
- Cloudflare Workers: 100,000 requests/day
- Supabase: 500MB database, 2GB storage, 50K users/month

---

## Prerequisites

1. **GitHub Account** (free)
2. **Cloudflare Account** (free)
3. **Supabase Account** (free)
4. **PayPal Developer Account** (free)
5. **Node.js 18+** installed locally

---

## Step 1: Supabase Setup (Database)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Enter:
   - **Organization**: Create new (e.g., "SoundCoin")
   - **Project Name**: `soundcoin-db`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `backend/schema.sql`
4. Paste and click **Run**
5. Verify tables were created in **Table Editor**

### 1.3 Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public**: `eyJ...` (for frontend)
   - **service_role secret**: `eyJ...` (for backend - keep secret!)

### 1.4 Configure Storage Buckets

1. Go to **Storage** → **New bucket**
2. Create buckets:
   - `music` (public, 50MB limit per file)
   - `ads` (public, 50MB limit per file)
   - `covers` (public, 5MB limit per file)
3. For each bucket, go to **Policies** → **Add policies**:
   - SELECT: `true` (public read)
   - INSERT: `auth.role() = 'authenticated'` (authenticated write)

### 1.5 Configure Auth

1. Go to **Authentication** → **Providers**
2. Enable desired OAuth providers:
   - **Google**: Add Client ID and Secret from Google Cloud Console
   - **GitHub**: Add Client ID and Secret from GitHub Developer Settings
3. Go to **URL Configuration**:
   - Site URL: `https://your-domain.pages.dev` (or localhost:5173 for dev)
   - Redirect URLs: Add `https://your-domain.pages.dev/auth/callback`

---

## Step 2: Cloudflare Setup (Backend + Frontend)

### 2.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2.2 Login to Cloudflare

```bash
wrangler login
```

This opens a browser to authenticate.

### 2.3 Deploy Backend Worker

```bash
cd backend

# Update wrangler.toml with your Supabase URL
# Edit: SUPABASE_URL = "https://your-project.supabase.co"

# Set secrets
wrangler secret put SUPABASE_SERVICE_KEY
# Enter your Supabase service_role key when prompted

# Deploy worker
wrangler deploy
```

Save the deployed worker URL (e.g., `https://soundcoin-api.your-subdomain.workers.dev`)

### 2.4 Create Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Pages** → **Create a project**
3. Choose **Upload assets** (manual deployment)
4. Project name: `soundcoin-app`
5. Click **Create project**

---

## Step 3: PayPal Setup (Payouts)

### 3.1 Create PayPal Developer Account

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Sign up / log in with your PayPal account
3. Go to **Dashboard** → **My Apps & Credentials**

### 3.2 Create App

1. Click **Create App**
2. App Name: `SoundCoin Payouts`
3. App Type: **Merchant**
4. Click **Create App**

### 3.3 Get Credentials

1. Copy **Client ID** and **Secret**
2. Toggle to **Sandbox** mode for testing
3. Save these for later

### 3.4 Enable Payouts API

1. In your app, go to **App Settings**
2. Under **Products**, ensure **Payouts** is enabled
3. For production, you'll need to apply for Payouts approval

### 3.5 Add PayPal Secrets to Worker

```bash
cd backend
wrangler secret put PAYPAL_CLIENT_ID
# Enter your PayPal Client ID

wrangler secret put PAYPAL_CLIENT_SECRET
# Enter your PayPal Secret
```

---

## Step 4: Domain Setup (Optional)

### Option A: Free Subdomain (Cloudflare)

Your app will be available at: `https://soundcoin-app.pages.dev` (free, no setup needed)

### Option B: Custom Domain (Free with Freenom)

1. Go to [freenom.com](https://freenom.com)
2. Search for a free domain (e.g., `soundcoin.tk`)
3. Complete registration (free for 12 months)
4. In Cloudflare Pages:
   - Go to **Custom domains**
   - Add your domain
   - Follow DNS setup instructions

### Option C: Custom Domain (Cloudflare Registrar)

1. Buy domain through Cloudflare (costs ~$10/year)
2. Automatic DNS configuration

---

## Step 5: Environment Configuration

### 5.1 Frontend Environment Variables

Create `app/.env.production`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

### 5.2 Backend Environment Variables

Update `backend/wrangler.toml`:

```toml
name = "soundcoin-api"
main = "worker.js"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "https://your-project.supabase.co"
# Secrets are set via wrangler secret put
```

---

## Step 6: Build and Deploy

### 6.1 Install Dependencies

```bash
cd app
npm install
```

### 6.2 Build Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### 6.3 Deploy to Cloudflare Pages

#### Option A: Drag & Drop (Easiest)

1. Go to Cloudflare Pages dashboard
2. Select your `soundcoin-app` project
3. Click **Create deployment**
4. Drag your `app/dist` folder
5. Click **Deploy**

#### Option B: Wrangler CLI

```bash
# In app directory
npx wrangler pages deploy dist --project-name=soundcoin-app
```

#### Option C: GitHub Integration (Recommended for CI/CD)

1. Push code to GitHub
2. In Cloudflare Pages, choose **Connect to Git**
3. Select your repository
4. Configure:
   - **Framework preset**: None
   - **Build command**: `cd app && npm install && npm run build`
   - **Build output directory**: `app/dist`
5. Click **Save and Deploy**

---

## Admin Setup

### 7.1 Create Admin User

1. Register a new account on your deployed app
2. In Supabase, go to **Table Editor** → **profiles**
3. Find your user, update email to include "admin" (e.g., `admin@yourdomain.com`)
4. Or use SQL:

```sql
UPDATE profiles 
SET email = 'admin@yourdomain.com' 
WHERE id = 'your-user-id';
```

### 7.2 Access Admin Dashboard

1. Log in with admin account
2. Navigate to `/admin`
3. You should see the admin dashboard with:
   - Stats overview
   - Redemption management
   - Track upload
   - Ad management
   - Settings

---

## Monetization Setup

### 8.1 Google AdSense (Free)

1. Go to [google.com/adsense](https://google.com/adsense)
2. Sign up with your domain
3. Add AdSense code to `app/index.html`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX"
     crossorigin="anonymous"></script>
```

4. Wait for approval (1-2 weeks)

### 8.2 Alternative Ad Networks

- **PropellerAds**: Instant approval
- **Adsterra**: Good for music sites
- **Media.net**: Yahoo/Bing network

### 8.3 Revenue Distribution

Configure in Admin Settings:
- **Owner Revenue %**: 30% (you keep)
- **User Payout %**: 70% (goes to coin rewards)
- **Coin Value**: $0.0001 per SoundCoin (10,000 = $1)
- **Audio Ad Reward**: 1 SoundCoin
- **Video Ad Reward**: 3 SoundCoins

**Example Math:**
- Audio ad CPM: $2 = $0.002 per ad
- You pay user: 1 SoundCoin = $0.0001
- Your profit: $0.0019 per audio ad (95% margin)
- Video ad CPM: $5 = $0.005 per ad
- You pay user: 3 SoundCoins = $0.0003
- Your profit: $0.0047 per video ad (94% margin)

---

## Post-Deployment Checklist

- [ ] Database schema deployed to Supabase
- [ ] Storage buckets created (music, ads, covers)
- [ ] Auth providers configured
- [ ] Backend worker deployed
- [ ] Frontend deployed to Pages
- [ ] Environment variables set
- [ ] Admin user created
- [ ] Sample tracks uploaded
- [ ] Sample ads uploaded
- [ ] PayPal sandbox tested
- [ ] AdSense application submitted
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### Issue: "Failed to fetch" errors
**Solution**: Check CORS settings in worker.js, ensure SUPABASE_URL is correct

### Issue: Auth not working
**Solution**: Verify redirect URLs in Supabase Auth settings match your domain

### Issue: File uploads failing
**Solution**: Check storage bucket policies, ensure user is authenticated

### Issue: PayPal payouts not working
**Solution**: Ensure you're using sandbox credentials for testing

### Issue: Real-time updates not working
**Solution**: Enable realtime in Supabase for profiles and coin_transactions tables

---

## Next Steps

1. **Import Music**: Use the bulk importer for free music libraries
2. **Create Ads**: Upload audio/video ads to earn revenue
3. **Invite Users**: Share your platform
4. **Monitor Analytics**: Track usage in Supabase dashboard
5. **Scale**: When free limits reached, upgrade plans

---

## Cost Summary

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Supabase | Free | $0 |
| Cloudflare Pages | Free | $0 |
| Cloudflare Workers | Free | $0 |
| Domain (optional) | Freenom | $0 |
| PayPal | Standard | $0 (2.9% + $0.30 per transaction) |
| **Total** | | **$0** |

---

## Support

For issues or questions:
1. Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
2. Check Cloudflare docs: [developers.cloudflare.com](https://developers.cloudflare.com)
3. Open an issue on GitHub

---

**Congratulations! Your SoundCoin platform is now live! 🎵💰**
