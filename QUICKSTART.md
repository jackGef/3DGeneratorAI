# Quick Start Guide - 3D Generator AI

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites
- Node.js 20.x or higher installed
- MongoDB running locally or MongoDB Atlas account
- Terminal/Command Prompt

---

## Step 1: Clone & Install (2 minutes)

```bash
# Navigate to project root
cd /home/yaakov/Desktop/Projects/3DGenerator

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../front
npm install

cd ..
```

---

## Step 2: Configure Environment (1 minute)

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/3d-generator

# JWT Secrets (change these!)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Email (optional for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Model Server
MODEL_SERVER_URL=http://localhost:5000

# Server
PORT=8081
NODE_ENV=development
```

**Quick Tip**: For local testing, you can skip email configuration. Email verification codes will be logged to the console.

---

## Step 3: Start the Services (2 minutes)

### Terminal 1 - Backend
```bash
cd backend
npm run build
npm start

# Should see:
# ✅ Server running on port 8081
# ✅ MongoDB connected
```

### Terminal 2 - Frontend
```bash
cd front
npm run dev

# Should see:
# ➜ Local: http://localhost:5174/
```

---

## Step 4: Access the Application

### Open Your Browser
Navigate to: **http://localhost:5174**

### Create Your First Account
1. Click "Register"
2. Enter email, username, and password
3. Check console logs for verification code
4. Enter the 6-digit code
5. Login with your credentials

### Start Generating!
1. Click "Generate" in the sidebar
2. Enter a prompt like "a red sports car"
3. Adjust parameters (optional)
4. Click "Generate 3D Model"
5. Check "Jobs" page for progress

---

## 🎯 What You Can Do Now

### User Features
- ✅ **Generate 3D Models** - From text descriptions
- ✅ **Manage Jobs** - View status, cancel, download
- ✅ **Chat** - Create conversations (assistant responses pending)
- ✅ **Dashboard** - View your statistics
- ✅ **Profile** - Manage your account

### Admin Features (Create admin user first)
- ✅ **User Management** - View all users
- ✅ **System Stats** - Monitor platform health
- ✅ **Admin Panel** - Access at `/admin`

---

## 🔧 Create Admin User

Run this in MongoDB shell or MongoDB Compass:

```javascript
// Connect to database
use 3d-generator

// Find your user
db.users.findOne({ email: "your-email@example.com" })

// Make them admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { roles: ["user", "admin"] } }
)
```

Or use the backend API:
```bash
# Get user token first (login in the app, check localStorage)
curl -X PUT http://localhost:8081/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## 🔍 Explore the API

### Swagger Documentation
Visit: **http://localhost:8081/api-docs**

Interactive API explorer with:
- All endpoints documented
- Try-it-out functionality
- Request/response schemas
- Authentication examples

---

## 📝 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Backend (port 8081)
lsof -ti:8081 | xargs kill -9

# Frontend (port 5174)
lsof -ti:5174 | xargs kill -9
```

### Issue: MongoDB Connection Failed
- Make sure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Try MongoDB Atlas for cloud database

### Issue: Email Verification Code Not Received
- Check backend console logs for the code
- Email configuration is optional for local testing
- Code format: 6 digits (e.g., "123456")

### Issue: TypeScript Errors in VS Code
```bash
# Restart TypeScript server
# In VS Code: Cmd/Ctrl + Shift + P
# Type: "TypeScript: Restart TS Server"
```

### Issue: Cannot Find Module Errors
```bash
# Rebuild frontend
cd front
npm run build

# Rebuild backend
cd backend
npm run build
```

---

## 🎨 Test Features Quickly

### 1. Test Authentication (1 min)
```
1. Register → Verify → Login
2. Check if token is in localStorage
3. Logout and verify redirect to login
```

### 2. Test Generation (2 min)
```
1. Go to "Generate" page
2. Enter: "a blue chair"
3. Click generate
4. Go to "Jobs" page
5. See job status (queued/running)
```

### 3. Test Chat (1 min)
```
1. Go to "Chats" page
2. Click "New Chat"
3. Send a message
4. See message appear
```

### 4. Test Dashboard (30 sec)
```
1. Go to "Dashboard"
2. See your stats
3. View recent activity
```

### 5. Test Admin (if admin)
```
1. Go to "Admin" page
2. View system stats
3. See user list (integration pending)
```

---

## 🐳 Docker Quick Start (Alternative)

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8081
- MongoDB: localhost:27017

---

## 📚 Next Steps

### Explore Documentation
- **Backend**: Read `backend/BACKEND_COMPLETE.md`
- **Frontend**: Read `front/FRONTEND_COMPLETE.md`
- **Project**: Read `PROJECT_COMPLETE.md`
- **API**: Visit http://localhost:8081/api-docs

### Customize the App
- Modify color scheme in CSS files
- Add new pages to frontend
- Create new API endpoints
- Integrate additional AI models

### Deploy to Production
- Set up MongoDB Atlas
- Configure email service (SendGrid, AWS SES)
- Deploy backend to Heroku, AWS, or DigitalOcean
- Deploy frontend to Vercel, Netlify, or AWS
- Set up CI/CD pipeline

---

## 🎯 Quick Reference

### Important URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:8081 |
| API Docs | http://localhost:8081/api-docs |
| MongoDB | mongodb://localhost:27017 |

### Default Credentials
| Type | Value |
|------|-------|
| JWT Token Expiry | 15 minutes |
| Refresh Token Expiry | 7 days |
| Rate Limit | 100 requests / 15 min |
| Default Guidance Scale | 15 |
| Default Steps | 64 |

### Useful Commands
```bash
# Backend
npm run build      # Compile TypeScript
npm start          # Start server
npm run dev        # Start with nodemon

# Frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Docker
docker-compose up -d              # Start all
docker-compose down               # Stop all
docker-compose logs -f            # View logs
docker-compose restart backend    # Restart service
```

---

## 🎉 You're All Set!

Your 3D Generator AI application is now running and ready to use!

**What's Working:**
- ✅ User registration and login
- ✅ Protected routes
- ✅ 3D model generation interface
- ✅ Job management
- ✅ Chat system
- ✅ Dashboard analytics
- ✅ Profile management
- ✅ Admin panel UI
- ✅ Responsive design
- ✅ API documentation

**Need Help?**
- Check the comprehensive docs in each directory
- Visit the Swagger UI for API details
- Review the project structure in PROJECT_COMPLETE.md

**Happy Generating! 🚀**
