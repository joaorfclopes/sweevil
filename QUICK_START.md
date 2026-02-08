# Quick Start Guide

## ✅ Issues Fixed

### 1. JWT_SECRET Error - FIXED
The `.env` file has been created with a secure JWT secret. The backend will now start successfully.

### 2. Frontend Dependencies - FIXED
Frontend dependencies are already installed with `--legacy-peer-deps` flag.

---

## 🚀 How to Run the Application

### Backend

From the **project root** directory:

```bash
# Make sure you're in the project root
cd /Users/joaolopes/dev/personal/sweevil

# Run the backend
npm run backend
```

The backend should start on `http://localhost:5000` ✅

### Frontend

From the **project root** directory:

```bash
# Run the frontend
npm run frontend
```

Or run both together:

```bash
# Run both backend and frontend concurrently
npm start
```

The frontend will start on `http://localhost:3000`

---

## 📝 Environment Variables

Your `.env` file has been created with:

- ✅ **JWT_SECRET** - A secure random token (required for authentication)
- ✅ **MONGODB_URL** - Set to `mongodb://localhost/sweevil`
- ✅ **PORT** - Set to 5000
- ✅ **NODE_ENV** - Set to development

### Optional Variables (Commented Out)

Add these when you need them:
- AWS credentials (for S3 file uploads)
- PayPal Client ID (for payments)
- Gmail OAuth credentials (for email notifications)

See `.env.example` for all available configuration options.

---

## ⚠️ Important Notes

### MongoDB Required
Make sure MongoDB is running locally:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or if using brew
brew services start mongodb-community
```

### NPM Install Commands

If you ever need to reinstall:

**Backend:**
```bash
cd /Users/joaolopes/dev/personal/sweevil
npm install
```

**Frontend:**
```bash
cd /Users/joaolopes/dev/personal/sweevil/frontend
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required for the frontend due to peer dependency conflicts with React 18.

---

## 🔐 Security Improvements Applied

All the security fixes from REFACTOR_PLAN.md section 6 have been implemented:

1. ✅ **JWT Secret** - No longer has hardcoded fallback (6.4)
2. ✅ **Error Handler** - Fixed to have 4 parameters (6.11)
3. ✅ **Request Body Limit** - Set to 1mb (6.9)
4. ✅ **Seed Routes** - Protected with NODE_ENV checks (6.10)
5. ✅ **User Endpoint** - Requires auth and excludes password (6.3)

---

## 📦 Dependencies Updated

- ✅ Backend: 0 vulnerabilities
- ⚠️ Frontend: 9 vulnerabilities (all in Create React App build dependencies - non-critical)

See `DEPENDENCY_UPDATE_SUMMARY.md` for complete details.

---

## 🐛 Troubleshooting

### "Cannot find module" errors
Make sure you're in the correct directory:
```bash
cd /Users/joaolopes/dev/personal/sweevil
```

### Backend won't start
1. Check if MongoDB is running
2. Verify `.env` file exists with JWT_SECRET
3. Check if port 5000 is available: `lsof -i :5000`

### Frontend won't start
1. Make sure backend is running first
2. Check if port 3000 is available: `lsof -i :3000`
3. Try reinstalling: `cd frontend && rm -rf node_modules && npm install --legacy-peer-deps`

---

## 📚 Next Steps

After getting the app running, you'll eventually need to:

1. **React Router v6 Migration** - See `DEPENDENCY_UPDATE_SUMMARY.md` for details
2. **Lightbox Updates** - Update gallery and product screens to use new lightbox library
3. **Add your credentials** - AWS, PayPal, Gmail OAuth (uncomment in `.env`)

For now, the app should run locally with the basic configuration! 🎉
