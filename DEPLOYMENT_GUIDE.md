# GitHub & Vercel Deployment Guide

## 📋 Prerequisites
- GitHub account (https://github.com)
- Vercel account (https://vercel.com) - can sign in with GitHub

---

## 🚀 STEP 1: Push to GitHub

### Option A: Create New Repository on GitHub.com (Recommended)

1. Go to https://github.com/new
2. Create a new repository named `astramarket` (or your preferred name)
3. **DO NOT** initialize with README, .gitignore, or license
4. Click "Create repository"

### Option B: Add Remote to Your Existing Repository

Run these commands in your terminal:

```bash
cd c:\Users\DELL\.gemini\antigravity\scratch\multi-vendor-ecommerce

# Replace USERNAME with your GitHub username and REPO with your repo name
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/coder123/astramarket.git
git branch -M main
git push -u origin main
```

You'll be asked for authentication:
- Use your **GitHub username** as username
- Use a **Personal Access Token** (PAT) as password:
  - Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope
  - Copy and paste in terminal

---

## 🌐 STEP 2: Deploy to Vercel

### Method A: Connect with GitHub (Easiest)

1. Go to https://vercel.com/new
2. Click "Import a Git Repository"
3. Paste your GitHub repo URL: `https://github.com/USERNAME/REPO`
4. Click "Continue"
5. **Configure Project Settings:**
   - **Root Directory:** Leave as `.`
   - **Framework Preset:** Vite (should auto-detect)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these for frontend:
     - `VITE_API_URL` = `https://your-backend-url.com` (leave empty for now)
     - `VITE_STRIPE_PUBLIC_KEY` = Your Stripe public key from dashboard
   
   - Add these for backend (if deploying backend separately):
     - `MONGODB_URI` = Your MongoDB connection string
     - `JWT_SECRET` = Your JWT secret key
     - `FRONTEND_URL` = Your Vercel frontend URL
     - `STRIPE_SECRET_KEY` = Your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret

7. Click "Deploy"

### Method B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd c:\Users\DELL\.gemini\antigravity\scratch\multi-vendor-ecommerce

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

---

## ⚙️ Backend Deployment (Optional - Use Services Below)

### Option 1: Deploy Backend to Render.com (Free)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add environment variables (same as above)
6. Deploy

### Option 2: Deploy Backend to Railway.app

1. Go to https://railway.app
2. Create new project
3. Add MongoDB plugin
4. Connect GitHub and select backend folder
5. Add environment variables
6. Deploy

### Option 3: Deploy Backend to Heroku (Paid)

1. Install Heroku CLI
2. Run:
```bash
cd backend
heroku login
heroku create your-app-name
git push heroku main
```

---

## 📝 Configuration After Deployment

### Update Frontend API URL

After backend is deployed, update `VITE_API_URL` in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings
2. Go to "Environment Variables"
3. Update `VITE_API_URL` to your backend URL
4. Redeploy from the "Deployments" tab

### Update Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Add new endpoint:
   - **URL:** `https://your-backend-url.com/api/payments/webhook`
   - **Events:** `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copy webhook secret to environment variables

---

## 🔒 Security Checklist

- [ ] MongoDB connection string uses authentication
- [ ] JWT_SECRET is a strong random string (min 32 chars)
- [ ] STRIPE keys are from production (not test keys)
- [ ] Environment variables are NOT in .env files committed to git
- [ ] vercel.json is committed but .env files are in .gitignore
- [ ] CORS is set to your production frontend URL only
- [ ] Database backups are configured

---

## ✅ Testing After Deployment

1. Visit your Vercel frontend: `https://your-project.vercel.app`
2. Test core flows:
   - [ ] Login / Signup
   - [ ] Browse products
   - [ ] Search with filters
   - [ ] Add to cart
   - [ ] Checkout (payment form shows)
   - [ ] View orders (if backend connected)
3. Check browser console for errors
4. Check Vercel logs for any issues

---

## 📊 URLs After Deployment

```
Frontend:  https://your-project.vercel.app
Backend:   https://your-api.railway.app (or render/heroku)
Stripe:    https://dashboard.stripe.com
GitHub:    https://github.com/USERNAME/REPO
```

---

## 🆘 Troubleshooting

### "Build Command Failed"
- Check `npm run build` works locally
- Ensure all dependencies in package.json
- Check for build console errors

### "API Not Responding"
- Verify `VITE_API_URL` environment variable
- Check backend is deployed and running
- Test backend URL directly in browser

### "Cannot Find Module"
- Run `npm install` in both root and backend
- Check all imports use `.js` extension in ESM

### "Permission Denied on Git Push"
- Use Personal Access Token (not password)
- Token needs `repo` scope
- Refresh token if expired

---

## 🎯 Quick Start Commands

```bash
# Commit and push all changes
cd c:\Users\DELL\.gemini\antigravity\scratch\multi-vendor-ecommerce
git add .
git commit -m "Deploy to production"
git push origin main

# Login to Vercel
npm i -g vercel
vercel login

# Deploy frontend to production
vercel --prod

# View logs
vercel logs
```

---

**For detailed Vercel docs:** https://vercel.com/docs
**For GitHub docs:** https://docs.github.com
**For Stripe webhook docs:** https://stripe.com/docs/webhooks
