# 3D Generator AI - Full Stack Application

> Generate 3D models from text prompts using AI, with complete user management, and admin controls.

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

### Run Locally
```bash
# Backend
cd backend && npm install && npm run build && npm start

# Frontend  
cd front && npm install && npm run dev
```

## 📚 Documentation

- **[DOCKER.md](./DOCKER.md)** - 🐳 Docker deployment guide
---

## ✨ Features

- ✅ User authentication with email verification
- ✅ JWT with automatic token refresh
- ✅ 3D model generation from text using Shap-E AI
- ✅ Chat system with message history
- ✅ Analytics dashboard with user stats
- ✅ Admin panel for user management
- ✅ Responsive UI (mobile, tablet, desktop)
- ✅ Multiple download formats (GLB, OBJ, MTL, PLY)
- ✅ Full Docker support with docker-compose

---

## 🛠️ Tech Stack

**Backend**: Node.js 20, Express, TypeScript, MongoDB, JWT, Winston  
**Frontend**: React 18, TypeScript, Vite, React Router, React Hot Toast  
**AI Model**: Shap-E (Python Flask server)  
**Deployment**: Docker, Docker Compose

---

## 🐳 Docker Services

The application runs 5 services:
- **MongoDB** - Database
- **Model Server** - AI generation (Python/Flask)
- **Backend** - API server (Node.js/Express)
- **Frontend** - Web UI (React/Vite)

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

---

## 🔌 Key URLs

### Local Development
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8081

### Docker Deployment
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
