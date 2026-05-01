# Sweevil

Full-stack e-commerce platform for tattoo-themed clothing and merchandise, with an art gallery, booking system, and order management.

## Features

- Product catalog with size/stock tracking and category filtering
- Shopping cart and Stripe checkout (free shipping over $40)
- Order lifecycle management: placed → paid → sent → delivered → cancelled
- Tattoo booking system with availability calendar and deposit flow
- Automated HTML email notifications for every order and booking status change (Gmail OAuth2)
- Gallery with category filtering, lightbox viewer, and drag-to-reorder
- Admin dashboard: product/order/gallery/booking CRUD, image uploads to AWS S3
- Passkey (WebAuthn) and Google OAuth authentication via better-auth — admin-only, no public registration
- Rate limiting and Helmet security headers

## Tech Stack

**Backend:** Node.js 18+, Express.js (ES modules), MongoDB + Mongoose 8, AWS S3 v3, Nodemailer, better-auth, Stripe

**Frontend:** React 18, Vite, Redux v5 + Redux Thunk, React Router v6, Material UI v6, Sass/SCSS, Framer Motion, Axios, @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- `.env` file (see `.env.example`)

### Install

```bash
npm install                              # root (backend) deps
cd frontend && npm install --legacy-peer-deps  # frontend deps
```

### Run locally

```bash
npm start          # backend (port 5000) + frontend (port 3000) concurrently
npm run backend    # backend only (nodemon)
npm run frontend   # frontend only
```

### Seed data (development only)

```
GET /api/users/seed
GET /api/products/seed
GET /api/gallery/seed
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URL` | Yes | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (min 32 chars) — generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | Backend base URL (e.g. `http://localhost:5000`) |
| `FRONTEND_URL` | Yes | Frontend URL — used for WebAuthn origin and trusted origins |
| `GOOGLE_CLIENT_ID` | Google OAuth | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Google OAuth2 client secret |
| `ALLOWED_EMAILS` | Google OAuth | Comma-separated list of emails allowed to sign in |
| `AWS_S3_BUCKET` | S3 uploads | S3 bucket name |
| `AWS_REGION` | S3 uploads | S3 region (default: `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | S3 uploads | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | S3 uploads | AWS secret key |
| `STRIPE_SECRET_KEY` | Payments | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Payments | Stripe publishable key |
| `MAILING_SERVICE_CLIENT_ID` | Email | Gmail OAuth2 client ID |
| `MAILING_SERVICE_CLIENT_SECRET` | Email | Gmail OAuth2 client secret |
| `MAILING_SERVICE_REFRESH_TOKEN` | Email | Gmail OAuth2 refresh token |
| `MAILING_SERVICE_ACCESS_TOKEN` | Email | Gmail OAuth2 access token |
| `VITE_SENDER_EMAIL_ADDRESS` | Email | Sender address |
| `BRAND_NAME` | No | Brand name (default: `Sweevil`) |
| `BRAND_LOGO` | No | Brand logo URL (used in emails) |
| `APP_DOMAIN` | Production | Canonical domain for HTTPS redirect |
| `ENABLE_BOOKING` | No | Set to `true` to enable the booking system |

## Project Structure

```
sweevil/
├── backend/
│   ├── server.js              # Entry point
│   ├── utils.js               # Auth middleware (isAuth, isAdmin)
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API handlers (all prefixed /api/)
│   └── mailing/               # HTML email templates
└── frontend/
    └── src/
        ├── screens/           # Page-level components
        ├── components/        # Reusable UI components
        ├── actions/           # Redux thunk actions
        ├── reducers/          # Redux reducers
        └── style/             # Sass/SCSS stylesheets
```

## API Routes

| Prefix | Purpose |
|---|---|
| `/api/users` | User management (admin) |
| `/api/auth` | better-auth — passkey + Google OAuth |
| `/api/products` | Product CRUD (admin) + listing (public) |
| `/api/orders` | Order creation, status updates, admin list |
| `/api/bookings` | Booking creation, status updates, admin list |
| `/api/availability` | Booking availability calendar |
| `/api/uploads` | S3 image upload/delete (admin) |
| `/api/gallery` | Gallery CRUD and reorder (admin) |
| `/api/categories` | Category management |
| `/api/email` | Transactional email triggers |
| `/api/webhook` | Stripe webhook handler |
| `/api/about` | About page content (admin) |

## Build & Deploy

```bash
npm run build    # Build frontend to frontend/build/
npm run deploy   # Commit, build, and push to Heroku
```

In production, Express serves the Vite build as static files.
