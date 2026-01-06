# Deployment Guide - Render.com

This guide will help you deploy your 3D Generator AI application to Render.com with a free subdomain.

## Prerequisites

1. **MongoDB Atlas Account** (Free Tier)
   - Render doesn't offer free MongoDB
   - Sign up at: https://www.mongodb.com/cloud/atlas/register
   - Create a free cluster
   - Get your connection string

2. **Render.com Account**
   - Sign up at: https://render.com
   - Connect your GitHub account

3. **Email Service** (for password reset, verification)
   - Gmail App Password (recommended)
   - Or any SMTP service

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a new FREE cluster (M0)
3. Create a database user (username & password)
4. Whitelist all IPs: `0.0.0.0/0` (under Network Access)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/3dgenerator?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Render (Using Blueprint)

### Option A: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New" → "Blueprint"**
3. **Connect your GitHub repository**: `3DGeneratorAI`
4. **Render will detect the `render.yaml` file**
5. **Set Environment Variables** (in Render dashboard):

   **For Backend Service:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail App Password
   - `EMAIL_FROM`: Your Gmail address

6. **Click "Apply"** - Render will deploy all services

### Option B: Deploy via GitHub Actions (Automated)

1. **Get Render Deploy Hooks**:
   - Go to each service in Render dashboard
   - Navigate to "Settings" → "Deploy Hook"
   - Copy the deploy hook URL

2. **Add Secrets to GitHub Repository**:
   - Go to your GitHub repo: Settings → Secrets and variables → Actions
   - Add these secrets:
     - `RENDER_DEPLOY_HOOK_BACKEND`: Backend deploy hook URL
     - `RENDER_DEPLOY_HOOK_FRONTEND`: Frontend deploy hook URL
     - `RENDER_DEPLOY_HOOK_MODEL_SERVER`: Model Server deploy hook URL

3. **Push to main branch** - GitHub Actions will auto-deploy!

## Step 3: Configure Services After Deployment

### Update Frontend Environment Variables

After backend deploys, update frontend's `VITE_API_BASE`:
1. Go to Frontend service in Render
2. Environment → Edit `VITE_API_BASE`
3. Set to: `https://3dgenerator-backend.onrender.com`
4. Save and redeploy

### Update Backend CORS

1. Go to Backend service in Render
2. Environment → Edit `ALLOWED_ORIGINS`
3. Set to: `https://3dgenerator-frontend.onrender.com`
4. Save and redeploy

## Step 4: Access Your Application

Your apps will be available at:
- **Frontend**: `https://3dgenerator-frontend.onrender.com`
- **Backend API**: `https://3dgenerator-backend.onrender.com`
- **Model Server**: `https://3dgenerator-model-server.onrender.com`

**Share this link with your friends**: `https://3dgenerator-frontend.onrender.com`

## Important Notes

### Free Tier Limitations

- **Services spin down after 15 minutes of inactivity**
  - First request after inactivity takes ~30-60 seconds (cold start)
  - Subsequent requests are fast
- **750 hours/month per service** (enough for hobby projects)
- **Limited resources**: May be slow for AI model generation

### Upgrade Recommendations (if needed)

If you need better performance:
- **Backend**: Upgrade to Starter ($7/month) - stays awake
- **Model Server**: Upgrade to Standard ($25/month) - more RAM/CPU for AI
- **Persistent Storage**: Included with paid plans (better for assets)

## Troubleshooting

### Services Won't Start
- Check logs in Render dashboard
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Model Server Timeout
- AI model is large and takes time to load on free tier
- Consider upgrading model-server to paid plan
- Or use Railway/Fly.io for better AI performance

### CORS Errors
- Verify `ALLOWED_ORIGINS` in backend matches frontend URL
- Check both URLs are using HTTPS

## Alternative: Manual Service Creation

If blueprint doesn't work, create services manually:

1. **Create Backend Web Service**:
   - New → Web Service
   - Connect repo, select `backend` folder
   - Docker deployment
   - Set environment variables

2. **Create Frontend Web Service**:
   - New → Web Service
   - Connect repo, select `front` folder
   - Docker deployment
   - Set `VITE_API_BASE`

3. **Create Model Server**:
   - New → Web Service
   - Connect repo, select `model-server` folder
   - Docker deployment

## Custom Domain (Optional)

To add your own domain:
1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Render: Service → Settings → Custom Domain
3. Add your domain and configure DNS records
4. Render provides free SSL certificates

---

**Need help?** Check Render docs: https://render.com/docs
