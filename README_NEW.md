# Text-to-3D Generator

A full-stack application for generating 3D models from text prompts using Shap-E, with a complete backend API, chat interface, and admin dashboard.

## 🎉 Project Status

**Backend:** ✅ **100% COMPLETE** - Production Ready!  
**Frontend:** 🚧 In Development  
**Model Server:** ✅ Operational

---

## 🚀 Quick Start

```bash
docker compose up --build
```

**Backend API:** http://localhost:8081  
**API Docs:** http://localhost:8081/api-docs  
**Frontend:** http://localhost:3000  
**Model Server:** http://localhost:5000

---

## 📚 Documentation

Comprehensive documentation available in `/backend/`:

1. **[AUTHENTICATION_TESTING.md](backend/AUTHENTICATION_TESTING.md)** - Auth flow testing
2. **[PHASE1_COMPLETE.md](backend/PHASE1_COMPLETE.md)** - Core functionality (JWT, CRUD)
3. **[PHASE2_COMPLETE.md](backend/PHASE2_COMPLETE.md)** - Production features (rate limiting, validation)
4. **[PHASE3_COMPLETE.md](backend/PHASE3_COMPLETE.md)** - Enterprise features (refresh tokens, logging, admin, analytics)
5. **[BACKEND_COMPLETE.md](backend/BACKEND_COMPLETE.md)** - Complete backend overview

---

## ✨ Backend Features (100% Complete)

### Authentication & Security
- ✅ JWT with refresh tokens (15min/7d)
- ✅ Token rotation on refresh
- ✅ Email verification
- ✅ Password reset flow
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (prevents abuse)
- ✅ Input validation (Zod)
- ✅ CORS configuration

### Core Features
- ✅ User management (CRUD, profiles)
- ✅ Chat system with messages
- ✅ 3D generation with job queue
- ✅ Job cancellation
- ✅ Asset management (glb, obj, mtl, ply)

### Enterprise Features
- ✅ Admin dashboard (user management, statistics)
- ✅ Analytics endpoints (metrics, dashboards)
- ✅ Winston logging (file rotation)
- ✅ Swagger API documentation
- ✅ Audit logging
- ✅ Production-ready deployment

---

## 📖 API Documentation

**Interactive Swagger UI:** http://localhost:8081/api-docs

**Key Endpoints:**
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/generate` - Generate 3D model
- `GET /api/jobs` - List your jobs
- `GET /api/admin/stats` - System statistics (admin only)
- `GET /api/analytics/dashboard` - Your dashboard data

See [PHASE3_COMPLETE.md](backend/PHASE3_COMPLETE.md) for complete API reference with curl examples.

---

## 🛠️ Technology Stack

**Backend:** Node.js, TypeScript, Express, MongoDB, JWT, Winston, Swagger  
**Frontend:** React, TypeScript, Vite  
**Model Server:** Python, Flask, Shap-E

---

## ⚙️ Configuration

Create `/backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/3d-generator
PORT=8081
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MODEL_SERVER_URL=http://model-server:5000
```

---

## 🚀 Production Deployment

See [PHASE3_COMPLETE.md](backend/PHASE3_COMPLETE.md) for complete deployment guide including:
- Environment configuration
- Security hardening
- Monitoring setup
- Database optimization
- Load balancing

---

**Backend Status:** ✅ 100% Complete - Production Ready!

**Built with ❤️ using Node.js, TypeScript, Express, MongoDB, React, and Shap-E**
