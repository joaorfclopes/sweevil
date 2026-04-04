# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
npm start              # Run backend + frontend concurrently
npm run backend        # Backend only (nodemon, watches backend/)
npm run frontend       # Frontend only (CRA dev server on port 3000)
npm run start:debug    # Run both with Node inspector enabled
```

### Build & Deploy

```bash
npm run build          # Build frontend for production (outputs to frontend/build/)
npm run deploy         # Trigger Heroku deploy (commits, builds, pushes)
```

### Frontend (run from project root or frontend/)

```bash
cd frontend && npm test                    # Run Jest tests
cd frontend && npm test -- --testPathPattern=MyComponent  # Run a single test
cd frontend && npm install --legacy-peer-deps  # Install frontend deps (required flag)
```

## Architecture

### Monorepo Structure

- **Root** — Express backend (ES modules, `"type": "module"`), shared config
- **`frontend/`** — Create React App (React 18), independent npm workspace
- Backend runs on port **5000**; frontend dev server on port **3000**
- In production, Express serves the CRA build from `frontend/build/`

### Backend

Entry point: `backend/server.js`

- **Framework:** Express.js with ES module imports
- **Database:** MongoDB via Mongoose 8
- **Auth:** JWT (Bearer tokens, 30-day expiry). `JWT_SECRET` env var is required — the app refuses to start without it.
- **File uploads:** AWS S3 via `@aws-sdk/client-s3` v3 + multer-s3
- **Email:** Nodemailer with Gmail OAuth2; templates in `backend/mailing/`

API routes are all prefixed `/api/`:

| Prefix | File |
|---|---|
| `/api/users` | `backend/routes/userRoute.js` |
| `/api/products` | `backend/routes/productRoute.js` |
| `/api/orders` | `backend/routes/orderRoute.js` |
| `/api/uploads` | `backend/routes/uploadRoute.js` |
| `/api/email` | `backend/routes/emailRoute.js` |
| `/api/gallery` | `backend/routes/galleryImageRoute.js` |

Auth middleware (`isAuth`, `isAdmin`) lives in `backend/utils.js`.

### Frontend

Entry point: `frontend/src/index.js` (React 18 `createRoot`)

- **Router:** React Router v6 (`BrowserRouter` in `App.js`)
- **State:** Redux (v5) + Redux Thunk v3 — store configured in `frontend/src/store.js`
- **UI:** MUI v6 + Sass/SCSS + Styled Components + Framer Motion
- **HTTP:** Axios

State is organized into slices: `productList/Details/Create/Update/Delete`, `cart`, `userSignin/Register/Details/Update/ForgotPassword/ResetPassword`, `orderCreate/Details/Pay/List/AdminList/Delete/Send/Deliver/Cancel`, `galleryImageList`.

Page-level components live in `frontend/src/screens/`; reusable UI in `frontend/src/components/`. SCSS styles are in `frontend/src/style/`, mirroring the screens/components split.

### Environment Variables

Required:
- `MONGODB_URL` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret

See `.env.example` for the full list (AWS S3, PayPal, email OAuth2, branding vars).
