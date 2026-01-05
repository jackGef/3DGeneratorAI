# CI/CD Setup Guide

## Testing the Pipeline

### 1. **Test Locally First**
```powershell
# Test backend
cd backend
npm install
npm run build

# Test frontend
cd ../front
npm install
npm run build

# Test model server
cd ../model-server
pip install -r requirements.txt
python -m py_compile app.py

# Test Docker builds
docker-compose build
```

### 2. **Test CI/CD on GitHub**

**Option A: Push to GitHub**
```powershell
git add .github/
git commit -m "Add CI/CD pipeline"
git push origin main
```
Then go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

**Option B: Act (Local GitHub Actions)**
```powershell
# Install act (GitHub Actions local runner)
choco install act-cli
# or
winget install nektos.act

# Run the CI workflow locally
act push
```

### 3. **Setup Deployment (Optional)**

To enable the CD workflow, add these secrets to your GitHub repo:
1. Go to: Settings → Secrets and variables → Actions → New repository secret
2. Add:
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Your Docker Hub access token
   - `SERVER_HOST` - Your server IP (if deploying to a server)
   - `SERVER_USER` - SSH username
   - `SERVER_SSH_KEY` - Private SSH key

### 4. **Manual Deployment**
- Go to Actions tab → Continuous Deployment → Run workflow

## What Happens

**CI (ci.yml)** - Runs on every push/PR:
- ✅ Type checks TypeScript code
- ✅ Lints code for errors
- ✅ Builds all Docker images
- ✅ Validates docker-compose config

**CD (cd.yml)** - Runs only on main branch:
- 🚀 Builds and pushes Docker images to registry
- 🚀 Can deploy to your server (when configured)
