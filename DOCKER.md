# Docker Deployment Guide

## 🐳 Docker Configuration Complete

This project includes full Docker support with docker-compose orchestration for all services.

---

## 📦 Services Overview

The docker-compose.yml defines 5 services:

### 1. **MongoDB** (Database)
- **Image**: mongo:6
- **Port**: 27017 (internal)
- **Volume**: `mongo_data` for persistent storage
- **Purpose**: Stores users, jobs, chats, messages, and assets metadata

### 2. **Redis** (Cache)
- **Image**: redis:7-alpine
- **Port**: 6379 (internal)
- **Purpose**: Caching and session management

### 3. **Model Server** (AI Service)
- **Build**: `./model-server`
- **Port**: 5000 (internal)
- **Volumes**:
  - Model weights (read-only)
  - Generated assets
  - Hugging Face cache
- **Purpose**: Shap-E AI model for 3D generation
- **Healthcheck**: HTTP endpoint at `/health`

### 4. **Backend** (API Server)
- **Build**: `./backend`
- **Port**: 8081 → 8081
- **Dependencies**: MongoDB, Model Server
- **Purpose**: REST API, authentication, business logic
- **Healthcheck**: Swagger docs endpoint

### 5. **Frontend** (Web UI)
- **Build**: `./front`
- **Port**: 3000 → 5173 (internal Vite port)
- **Dependencies**: Backend
- **Purpose**: React UI served by Vite dev server

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker 20.x or higher
- Docker Compose v2.x or higher
- 8GB+ RAM (for model server)
- 10GB+ disk space (for model weights)

### 2. Start All Services
```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Swagger Docs**: http://localhost:8081/api-docs

### 4. Stop All Services
```bash
# Stop and remove containers
docker compose down

# Stop, remove, and delete volumes
docker compose down -v
```

---

## ⚙️ Environment Variables

### Backend Environment Variables

The docker-compose.yml sets these by default:

```yaml
PORT=8081                              # Server port
MONGODB_URI=mongodb://mongo:27017/3d-generator  # Database connection
MODEL_SERVER_URL=http://model-server:5000       # AI service URL
JWT_SECRET=docker-jwt-secret-change-in-production
JWT_REFRESH_SECRET=docker-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
```

### Optional Email Configuration

Create a `.env` file in the project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

Then docker-compose will use these values.

### Frontend Environment Variable

```yaml
VITE_API_BASE=http://localhost:8081  # Backend API URL
```

---

## 🔧 Docker Commands

### Build Only
```bash
# Build all services
docker compose build

# Build specific service
docker compose build backend
docker compose build front
```

### Start/Stop Services
```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# Stop services
docker compose stop

# Start specific service
docker compose up backend
```

### View Logs
```bash
# All services
docker compose logs

# Follow logs
docker compose logs -f

# Specific service
docker compose logs backend
docker compose logs -f front

# Last 100 lines
docker compose logs --tail=100
```

### Execute Commands in Container
```bash
# Backend shell
docker compose exec backend sh

# Run npm command in backend
docker compose exec backend npm run build

# MongoDB shell
docker compose exec mongo mongosh

# Check backend logs directory
docker compose exec backend ls -la logs/
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart front
```

### Remove Everything
```bash
# Stop and remove containers
docker compose down

# Also remove volumes (WARNING: deletes database data!)
docker compose down -v

# Also remove images
docker compose down --rmi all
```

---

## 📊 Service Dependencies

```
Frontend → Backend → Model Server
                  ↓
              MongoDB
```

- Frontend waits for Backend to be healthy
- Backend waits for MongoDB and Model Server
- Model Server has extensive healthcheck (40 retries)

---

## 🐛 Troubleshooting

### Issue: Services won't start

**Check logs:**
```bash
docker compose logs
```

**Check service status:**
```bash
docker compose ps
```

### Issue: Port already in use

**Find and kill process:**
```bash
# Linux/Mac
lsof -ti:8081 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Or change ports in docker-compose.yml
ports:
  - "8082:8081"  # Use 8082 instead
```

### Issue: Backend can't connect to MongoDB

**Check MongoDB is running:**
```bash
docker compose ps mongo
docker compose logs mongo
```

**Verify connection string:**
- Should be: `mongodb://mongo:27017/3d-generator`
- NOT: `mongodb://localhost:27017/...`

### Issue: Frontend can't reach Backend

**Check backend health:**
```bash
docker compose ps backend
docker compose logs backend
```

**Verify API URL in browser:**
- Open browser console
- Check network requests
- Should point to: `http://localhost:8081`

### Issue: Model server fails healthcheck

**Model server needs time to load:**
```bash
# Check progress
docker compose logs -f model-server

# The healthcheck retries 40 times (10 minutes)
# Be patient, especially on first run
```

**If still failing:**
```bash
# Check if model weights exist
ls -la model-weights/renderer/
ls -la model-weights/shap_e_renderer/

# Try manual healthcheck
docker compose exec model-server wget -O- http://localhost:5000/health
```

### Issue: Out of memory

**Increase Docker memory:**
- Docker Desktop → Settings → Resources
- Set memory to 8GB minimum
- Recommended: 12GB for comfortable operation

### Issue: Slow build times

**Use build cache:**
```bash
# Docker uses cache by default
docker compose build

# Force rebuild without cache
docker compose build --no-cache
```

**Pre-pull images:**
```bash
docker compose pull
```

---

## 🔒 Security Notes

### Production Deployment

⚠️ **IMPORTANT**: Change these before production:

1. **JWT Secrets**
```yaml
JWT_SECRET=use-a-long-random-string-here-at-least-32-chars
JWT_REFRESH_SECRET=another-different-long-random-string
```

Generate secure secrets:
```bash
# Linux/Mac
openssl rand -base64 32
openssl rand -base64 32
```

2. **MongoDB Authentication**

Add to docker-compose.yml:
```yaml
mongo:
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=secure-password
```

Update backend connection:
```yaml
MONGODB_URI=mongodb://admin:secure-password@mongo:27017/3d-generator?authSource=admin
```

3. **Use Production Build for Frontend**

Create `front/Dockerfile.prod`:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

4. **Use HTTPS**
- Set up reverse proxy (Nginx, Traefik, Caddy)
- Get SSL certificates (Let's Encrypt)
- Update CORS configuration

---

## 📈 Performance Optimization

### 1. Multi-stage Builds (Backend)

Optimize backend Dockerfile:
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 8081
CMD ["node", "dist/index.js"]
```

### 2. Docker Compose Production Override

Create `docker-compose.prod.yml`:
```yaml
version: "3.9"

services:
  backend:
    environment:
      - NODE_ENV=production
    restart: always
    
  front:
    build:
      context: ./front
      dockerfile: Dockerfile.prod
    restart: always
```

Run with:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Resource Limits

Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

---

## 🧪 Development vs Production

### Development (Current Setup)
- ✅ Hot reload enabled (Vite dev server)
- ✅ Source maps included
- ✅ Detailed error messages
- ✅ No authentication on MongoDB
- ⚠️ Default JWT secrets (insecure)

### Production Recommendations
- ✅ Build optimized bundles
- ✅ Use Nginx to serve frontend
- ✅ Enable MongoDB authentication
- ✅ Use secure JWT secrets
- ✅ Set up HTTPS/SSL
- ✅ Configure logging aggregation
- ✅ Set up monitoring (health checks)
- ✅ Use environment-specific configs
- ✅ Enable resource limits

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Update JWT secrets in docker-compose.yml
- [ ] Configure MongoDB authentication
- [ ] Set up email service credentials
- [ ] Review and update CORS configuration
- [ ] Test all services locally with Docker
- [ ] Create backup strategy for MongoDB

### Production Setup
- [ ] Set up reverse proxy (Nginx/Traefik)
- [ ] Configure SSL certificates
- [ ] Set up logging aggregation
- [ ] Configure monitoring and alerts
- [ ] Set up CI/CD pipeline
- [ ] Configure automated backups
- [ ] Set resource limits
- [ ] Enable container restart policies

### Post-deployment
- [ ] Verify all services are healthy
- [ ] Test authentication flow
- [ ] Test 3D generation
- [ ] Monitor logs for errors
- [ ] Test backup and restore
- [ ] Document deployment process

---

## 🎯 Docker Compose File Reference

### Current Configuration

```yaml
version: "3.9"

name: text-to-3d-shape

volumes:
  mongo_data:       # MongoDB data persistence
  assets_data:      # Generated 3D models
  hf_cache:         # Hugging Face model cache

networks:
  appnet:           # Internal network for all services

services:
  mongo:            # Database
  redis:            # Cache
  model-server:     # AI service
  backend:          # API server
  front:            # Web UI
```

### Ports Mapping

| Service | Internal | External | Access |
|---------|----------|----------|--------|
| MongoDB | 27017 | - | Internal only |
| Redis | 6379 | - | Internal only |
| Model Server | 5000 | - | Internal only |
| Backend | 8081 | 8081 | http://localhost:8081 |
| Frontend | 5173 | 3000 | http://localhost:3000 |

---

## 🎉 Summary

✅ **Docker Configuration Complete!**

- ✅ All Dockerfiles created and configured
- ✅ docker-compose.yml updated with correct ports and env vars
- ✅ .dockerignore files added
- ✅ Health checks configured
- ✅ Service dependencies properly defined
- ✅ Volume mounts configured
- ✅ Production-ready with security notes

**To start:**
```bash
docker compose up -d --build
```

**To stop:**
```bash
docker compose down
```

**Everything is ready for Docker deployment! 🚀**
