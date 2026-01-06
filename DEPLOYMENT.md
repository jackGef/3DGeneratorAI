# Deployment Guide - Hybrid Setup

This guide will help you deploy your 3D Generator AI application using:
- **Hugging Face Spaces** for the AI Model Server (FREE, 16GB RAM)
- **Render.com** for Backend + Frontend (FREE tier)
- **MongoDB Atlas** for Database (FREE tier)

This hybrid approach gives you completely free hosting with enough resources for AI workloads!

## Prerequisites

1. **MongoDB Atlas Account** (Free Tier)
   - Sign up at: https://www.mongodb.com/cloud/atlas/register
   - Create a free cluster
   - Get your connection string

2. **Hugging Face Account** (Free)
   - Sign up at: https://huggingface.co/join
   - For the AI model server

3. **Render.com Account** (Free)
   - Sign up at: https://render.com
   - Connect your GitHub account

4. **Email Service** (for password reset, verification)
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

## Step 2: Deploy Model Server to Hugging Face Spaces

### Why Hugging Face?
- **16GB RAM on free tier** (vs 512MB on Render)
- Designed for AI/ML workloads
- Perfect for PyTorch + Shap-E model
- Completely FREE forever

### Deployment Steps:

1. **Go to Hugging Face Spaces**: https://huggingface.co/spaces

2. **Create New Space**:
   - Click "Create new Space"
   - **Name**: `3dgenerator-model-server` (or your preferred name)
   - **License**: Apache 2.0
   - **SDK**: Select **Docker** ⚠️ Important!
   - **Hardware**: CPU basic (free)
   - **Visibility**: Public

3. **Upload Files via Web Interface**:
   
   Go to your space → "Files" tab → Upload these files from `model-server/` folder:
   
   - `Dockerfile`
   - `app.py`
   - `requirements.txt`
   - `HF_README.md` (rename to `README.md` when uploading)

4. **Wait for Build**:
   - HF Spaces automatically builds your Docker container
   - First build takes 5-10 minutes
   - Model weights (~2-3GB) download on first run
   - Watch the build logs in the "Logs" tab

5. **Get Your Space URL**:
   - Your space URL will be: `https://YOUR_USERNAME-3dgenerator-model-server.hf.space`
   - Example: `https://jackgef-3dgenerator-model-server.hf.space`
   - **Copy this URL** - you'll need it for Render setup

6. **Test Your Model Server**:
   ```bash
   curl https://YOUR_USERNAME-3dgenerator-model-server.hf.space/health
   # Should return: {"status":"ok"}
   ```

### Alternative: Deploy via Git (Advanced)

```bash
# Clone your HF Space repo
git clone https://huggingface.co/spaces/YOUR_USERNAME/3dgenerator-model-server
cd 3dgenerator-model-server

# Copy model-server files
cp ../3DGeneratorAI/model-server/* .
mv HF_README.md README.md

# Push to HF
git add .
git commit -m "Initial deployment"
git push
```

## Step 3: Deploy Backend + Frontend to Render (Using Blueprint)

### Option A: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New" → "Blueprint"**
3. **Connect your GitHub repository**: `3DGeneratorAI`
4. **Render will detect the `render.yaml` file**
5. **Set Environment Variables** (in Render dashboard):

   **For Backend Service:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `MODEL_SERVER_URL`: Your HF Space URL (e.g., `https://jackgef-3dgenerator-model-server.hf.space`)
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail App Password
   - `EMAIL_FROM`: Your Gmail address

6. **Click "Apply"** - Render will deploy backend and frontend

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
     - ~~`RENDER_DEPLOY_HOOK_MODEL_SERVER`~~ (Not needed - deployed on HF)

3. **Push to main branch** - GitHub Actions will auto-deploy!

## Step 4: Configure Services After Deployment

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

## Step 5: Access Your Application

Your apps will be available at:
- **Frontend**: `https://3dgenerator-frontend.onrender.com` 🎉
- **Backend API**: `https://3dgenerator-backend.onrender.com`
- **Model Server**: `https://YOUR_USERNAME-3dgenerator-model-server.hf.space`

**Share this link with your friends**: `https://3dgenerator-frontend.onrender.com`

## Important Notes

### Free Tier Limitations

**Render (Backend + Frontend):**
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30-60 seconds (cold start)
- 750 hours/month per service (enough for hobby projects)

**Hugging Face Spaces (Model Server):**
- Always on (doesn't sleep!)
- 16GB RAM (perfect for AI models)
- Shared CPU (may be slower during peak times)
- First model generation takes longer (~30-60s to load model)
- Completely FREE with no credit card required

### Cost Comparison

| Component | Platform | Plan | Cost | RAM |
|---Backend Can't Connect to Model Server
- Verify `MODEL_SERVER_URL` in Render backend env vars
- Should be: `https://YOUR_USERNAME-3dgenerator-model-server.hf.space` (no trailing slash)
- Test model server health: `curl https://YOUR_SPACE_URL/health`

### Model Server Build Fails on HF
- Model loading can take 30-60 seconds on first request
- Be patient - HF Spaces are slower on cold start
- Consider upgrading to GPU for fasterctly

### Model Generation Times Out
- First generation is slow (model loading)
- Subsequent generations are faster
- Consider upgrading to GPU on HF ($9/month)

### Services Won't Start on Render------|------|-----|
| Backend | Render | Free | $0 | 512MB |
| Frontend | Render | Free | $0 | 512MB |
| Model Server | Hugging Face | Free | $0 | 16GB ✨ |
| Database | MongoDB Atlas | M0 | $0 | - |
| **TOTAL** | - | - | **$0/month** | - |

Compare to all-Render setup: Would need $25/month for model server!

### Upgrade Options (Optional)

If you need better performance:
- **Backend/Frontend on Render**: Upgrade to Starter ($7/month each) - no sleep
- **Model Server on HF**: Upgrade to GPU ($9/month) - 10x faster generation

## Troubleshooting
 on Render

If blueprint doesn't work, create services manually:

1. **Create Backend Web Service**:
   - New → Web Service
   - Connect repo, select `backend` folder
   - Docker deployment
   - Set all environment variables (including `MODEL_SERVER_URL`)

2. **Create Frontend Web Service**:
   - New → Web Service
   - Connect repo, select `front` folder
   - Docker deployment
   - Set `VITE_API_BASE`

3. **Model Server is on Hugging Face** (see Step 2 above)

## Updating Your Deployment

### Update Model Server (HF Spaces):
```bash
# Make changes to model-server files
cd model-server
# Then upload via HF web interface or push via git
```

### Update Backend/Frontend (Render):
- Push to `main` branch on GitHub
- Render auto-deploys (if connected to GitHub)
- Or trigger manual deploy in Render dashboard

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Your Friend's Browser              │
│         https://3dgenerator-frontend.onrender.com   │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Render.com (Frontend)                  │
│                   React + Vite                       │
│                   FREE - 512MB                       │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Render.com (Backend)                   │
│               Node.js + Express                      │
│                   FREE - 512MB                       │
└────────┬───────────────────────┬────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐   ┌───────────────────────────────┐
│  MongoDB Atlas  │   │    Hugging Face Spaces        │
│   Database      │   │     Model Server (AI)         │
│  FREE - M0      │   │   PyTorch + Shap-E            │
└─────────────────┘   │   FREE - 16GB RAM             │
                      └───────────────────────────────┘
```

All FREE! 🎉b Service**:
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
