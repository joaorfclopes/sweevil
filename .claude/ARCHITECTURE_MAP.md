# Architecture Map

**File locations and project structure**

---

## Directory Structure

```
project/
├── backend/
│   ├── server.js              # Entry point
│   ├── routes/
│   │   ├── userRoute.js
│   │   ├── productRoute.js
│   │   ├── orderRoute.js
│   │   ├── uploadRoute.js
│   │   ├── emailRoute.js
│   │   └── galleryImageRoute.js
│   ├── mailing/               # Nodemailer email templates
│   └── utils.js               # isAuth, isAdmin middleware
├── frontend/
│   ├── src/
│   │   ├── index.js           # Entry point (React 18 createRoot)
│   │   ├── App.js             # BrowserRouter lives here
│   │   ├── store.js           # Redux store config
│   │   ├── screens/           # Page-level components
│   │   ├── components/        # Reusable UI components
│   │   └── style/             # SCSS (mirrors screens/components split)
│   └── build/                 # Production CRA output
├── CLAUDE.md
└── package.json               # Root — runs backend + frontend concurrently
```

## Key File Locations

- **Backend entry**: `backend/server.js`
- **Auth middleware**: `backend/utils.js` (`isAuth`, `isAdmin`)
- **Frontend entry**: `frontend/src/index.js`
- **Redux store**: `frontend/src/store.js`
- **Email templates**: `backend/mailing/`
- **Frontend deps install**: always use `--legacy-peer-deps`

## Ports

- Backend (Express): **5000**
- Frontend (CRA dev): **3000**
- Production: Express serves CRA build from `frontend/build/`

## API Routes

All routes prefixed `/api/`:

| Prefix          | File                                            |
| --------------- | ----------------------------------------------- |
| `/api/users`    | `backend/routes/userRoute.js`                   |
| `/api/products` | `backend/routes/productRoute.js`                |
| `/api/orders`   | `backend/routes/orderRoute.js`                  |
| `/api/uploads`  | `backend/routes/uploadRoute.js`                 |
| `/api/email`    | `backend/routes/emailRoute.js`                  |
| `/api/gallery`  | `backend/routes/galleryImageRoute.js`           |
| `/api/auth/*`   | better-auth (built-in, not a custom route file) |

## Frontend State (Redux Slices)

`productList/Details/Create/Update/Delete`, `cart`, `userSignin/Register/Details/Update/ForgotPassword/ResetPassword`, `orderCreate/Details/Pay/List/AdminList/Delete/Send/Deliver/Cancel`, `galleryImageList`

## Tech Stack

- **Backend**: Express.js, ES modules (`"type": "module"`), MongoDB + Mongoose 8
- **Auth**: better-auth + passkey plugin, cookie-based sessions (8h expiry, 30min idle), no passwords/JWTs
- **File uploads**: AWS S3 via `@aws-sdk/client-s3` v3 + multer-s3
- **Email**: Nodemailer + Gmail OAuth2
- **Frontend**: React 18, React Router v6, Redux v5 + Thunk v3, MUI v6, Sass/SCSS, Styled Components, Framer Motion, Axios

---

**Last Updated**: 2026-05-11
