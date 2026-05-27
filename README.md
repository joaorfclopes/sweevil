# Sweevil

Public e-shop and booking site for a tattoo studio. Clients browse, buy, and book anonymously. Two admin users manage the backend.

## Stack

- **Backend:** Node.js + Express.js + MongoDB/Mongoose 8
- **Frontend:** React 18 + Redux v5 + Vite
- **Auth:** Passkeys via [better-auth](https://better-auth.com)
- **Payments:** Stripe (Payment Intents + webhooks)
- **Storage:** AWS S3 (product images, gallery)
- **Email:** Nodemailer
- **Error tracking:** Sentry

## Features

- Product shop with cart, checkout, and Stripe payment
- Booking system with availability calendar and Stripe payment
- Gallery management with drag-and-drop reordering
- Admin panel: products, orders, bookings, gallery, about page
- Passkey registration and authentication

## Prerequisites

- Node.js ≥ 18
- MongoDB instance (local or Atlas)
- Stripe account (test or live keys)
- AWS S3 bucket

## Setup

```bash
npm install
cd frontend && npm install && cd ..
cp .env.example .env   # fill in all required values
```

## Run locally

```bash
npm start              # backend (port 8080) + frontend (Vite, port 5173)
npm run backend        # backend only
npm run frontend       # frontend only
```

## Build

```bash
npm run build          # builds frontend/dist for production
```

## Deploy

Deployed on Heroku. Push to master triggers build via `Procfile`.

```bash
npm run deploy         # git push heroku master
```

## Environment variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `AWS_ACCESS_KEY_ID` | S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| `AWS_S3_BUCKET_NAME` | S3 bucket name |
| `BETTER_AUTH_SECRET` | better-auth secret |
| `BETTER_AUTH_URL` | App base URL for better-auth |
| `SENTRY_DSN` | Sentry DSN (optional) |
