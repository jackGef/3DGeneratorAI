# 3D Generator AI - Full Stack Application

> Generate 3D models from text prompts using AI, with complete user management, job tracking, and admin controls.

[![Status](https://img.shields.io/badge/Status-Complete-brightgreen)]()
[![Backend](https://img.shields.io/badge/Backend-100%25-blue)]()
[![Frontend](https://img.shields.io/badge/Frontend-100%25-blue)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)]()

---

## ⚡ Quick Start

### Run with Docker (Recommended)
```bash
docker compose up --build
```
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8081
- **API Docs**: http://localhost:8081/api-docs

### Run Locally
```bash
# Backend
cd backend && npm install && npm run build && npm start

# Frontend  
cd front && npm install && npm run dev
```

**📖 See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions**

---

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[DOCKER.md](./DOCKER.md)** - 🐳 Docker deployment guide
- **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** - Complete project overview
- **[backend/BACKEND_COMPLETE.md](./backend/BACKEND_COMPLETE.md)** - Backend documentation
- **[front/FRONTEND_COMPLETE.md](./front/FRONTEND_COMPLETE.md)** - Frontend documentation
- **API Docs**: http://localhost:8081/api-docs (when running)

---

## ✨ Features

- ✅ User authentication with email verification
- ✅ JWT with automatic token refresh (15min/7d)
- ✅ 3D model generation from text using Shap-E AI
- ✅ Job management with status tracking
- ✅ Chat system with message history
- ✅ Analytics dashboard with user stats
- ✅ Admin panel for user management
- ✅ Responsive UI (mobile, tablet, desktop)
- ✅ Multiple download formats (GLB, OBJ, MTL, PLY)
- ✅ Interactive API documentation (Swagger)
- ✅ Full Docker support with docker-compose

---

## 🛠️ Tech Stack

**Backend**: Node.js 20, Express, TypeScript, MongoDB, JWT, Winston, Swagger  
**Frontend**: React 18, TypeScript, Vite, React Router, React Hot Toast  
**AI Model**: Shap-E (Python Flask server)  
**Deployment**: Docker, Docker Compose

---

## 🐳 Docker Services

The application runs 5 services:
- **MongoDB** - Database
- **Redis** - Cache
- **Model Server** - AI generation (Python/Flask)
- **Backend** - API server (Node.js/Express)
- **Frontend** - Web UI (React/Vite)

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

---

## 🔌 Key URLs

### Local Development
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8081
- **API Docs**: http://localhost:8081/api-docs

### Docker Deployment
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081

---

## 🎯 Status: 100% Complete ✅

**Backend**: 40+ API endpoints, 6 database models, JWT auth, Winston logging  
**Frontend**: 8 pages, responsive design, complete API integration  
**Docker**: Full orchestration with health checks and proper dependencies  
**Features**: Auth, generation, jobs, chats, analytics, admin panel

**Project ready for testing and deployment! 🚀**
