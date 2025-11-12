# Admin User Management

This guide explains how to create admin users and manage admin privileges in the 3D Generator application.

## Understanding Roles

The application uses a role-based access control system where users have a `roles` array in their profile:
- **`['user']`** - Regular user (default)
- **`['user', 'admin']`** - Admin user with elevated privileges

## Method 1: Using Scripts (Recommended)

### Make a User Admin

```bash
cd backend
npx ts-node src/scripts/makeAdmin.ts user@example.com
```

**Output:**
```
✅ Connected to MongoDB
✅ Successfully made "user@example.com" an admin
   Updated roles: [user, admin]
   Username: johndoe
🔌 Disconnected from MongoDB
```

### Remove Admin Privileges

```bash
cd backend
npx ts-node src/scripts/removeAdmin.ts user@example.com
```

**Output:**
```
✅ Connected to MongoDB
✅ Successfully removed admin role from "user@example.com"
   Updated roles: [user]
   Username: johndoe
🔌 Disconnected from MongoDB
```

## Method 2: Direct MongoDB Command

### Connect to MongoDB

```bash
mongosh
```

### Switch to Your Database

```javascript
use text-to-3d
```

### Make a User Admin

```javascript
// By email
db.users.updateOne(
  { email: "user@example.com" },
  { $addToSet: { roles: "admin" } }
)

// By username
db.users.updateOne(
  { userName: "johndoe" },
  { $addToSet: { roles: "admin" } }
)
```

### Remove Admin Role

```javascript
// By email
db.users.updateOne(
  { email: "user@example.com" },
  { $pull: { roles: "admin" } }
)
```

### Check User Roles

```javascript
// Find user and display roles
db.users.findOne(
  { email: "user@example.com" },
  { email: 1, userName: 1, roles: 1, _id: 0 }
)
```

### List All Admin Users

```javascript
db.users.find(
  { roles: "admin" },
  { email: 1, userName: 1, roles: 1, _id: 0 }
)
```

## Method 3: Using API (If Implemented)

If you have admin API endpoints, you can use them:

```bash
# Get auth token first
TOKEN="your_jwt_token"

# Make user admin (requires admin privileges)
curl -X PATCH http://localhost:8081/api/users/:userId/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["user", "admin"]}'
```

## Creating the First Admin User

When setting up the application for the first time:

1. **Register a normal user** through the UI or API
2. **Use Method 1 (Script) or Method 2 (MongoDB)** to promote them to admin
3. **That admin can now manage other users** through the Admin Panel

### Quick Setup

```bash
# 1. Start the application
docker-compose up -d

# 2. Register a user through the UI (http://localhost:3000)
#    Email: admin@example.com
#    Password: your-secure-password

# 3. Make them admin
cd backend
npx ts-node src/scripts/makeAdmin.ts admin@example.com

# 4. Log in again to get admin access
```

## Verifying Admin Access

Once a user is an admin, they will have access to:
- **Admin Panel** in the UI (`/admin` route)
- **User management endpoints** in the API
- **System statistics and monitoring**

### Check if User is Admin (Frontend)

The frontend `AuthContext` provides the user's roles:

```typescript
const { user } = useAuth();
const isAdmin = user?.roles?.includes('admin');
```

### Check if User is Admin (Backend)

Use the auth middleware to protect admin routes:

```typescript
router.get('/admin/users', requireAdmin, getAllUsers);
```

## Troubleshooting

### Script Errors

**"User not found"**
- Verify the email address is correct
- Check the user exists in the database: `db.users.findOne({email: "user@example.com"})`

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running: `systemctl status mongod`
- Check `MONGODB_URI` environment variable
- Verify connection string in `.env` file

**"Module not found"**
- Make sure you're in the `backend` directory
- Install dependencies: `npm install`

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
systemctl status mongod

# Start MongoDB if needed
sudo systemctl start mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"
```

## Security Best Practices

1. **Limit admin users** - Only give admin access to trusted users
2. **Use strong passwords** - Enforce password requirements
3. **Monitor admin actions** - Log all admin operations
4. **Regular audits** - Periodically review admin user list
5. **Remove unused admins** - Revoke admin access when no longer needed

## Admin Permissions

Admin users can typically:
- ✅ View all users in the system
- ✅ Manage user accounts (activate/deactivate)
- ✅ View system statistics
- ✅ Monitor all jobs and generations
- ✅ Access admin-only API endpoints
- ❌ Cannot view other users' passwords (they're hashed)

## Example Workflow

```bash
# 1. List all users to find the one you want to promote
mongosh
use text-to-3d
db.users.find({}, {email: 1, userName: 1, roles: 1})

# 2. Make user admin
exit
cd backend
npx ts-node src/scripts/makeAdmin.ts user@example.com

# 3. Verify in MongoDB
mongosh
use text-to-3d
db.users.findOne({email: "user@example.com"}, {roles: 1})

# Should show: { roles: [ 'user', 'admin' ] }
```

## Related Files

- **User Model**: `backend/src/models/user.model.ts`
- **Make Admin Script**: `backend/src/scripts/makeAdmin.ts`
- **Remove Admin Script**: `backend/src/scripts/removeAdmin.ts`
- **Auth Middleware**: `backend/src/middleware/auth.middleware.ts`
- **Admin Page**: `front/src/pages/AdminPage.tsx`
