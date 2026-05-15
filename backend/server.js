import dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/node';
import './instrument.js';
import { toNodeHandler } from 'better-auth/node';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { getAuth } from './auth.js';
import aboutRoute from './routes/aboutRoute.js';
import availabilityRoute from './routes/availabilityRoute.js';
import bookingRoute from './routes/bookingRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import emailRoute from './routes/emailRoute.js';
import galleryImageRoute from './routes/galleryImageRoute.js';
import geoRoute from './routes/geoRoute.js';
import orderRoute from './routes/orderRoute.js';
import productCategoryRoute from './routes/productCategoryRoute.js';
import productRoute from './routes/productRoute.js';
import uploadRoute from './routes/uploadRoute.js';
import userRoute from './routes/userRoute.js';
import webhookRoute from './routes/webhookRoute.js';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('FATAL ERROR: BETTER_AUTH_SECRET is not defined in environment variables');
}
if (!process.env.ALLOWED_EMAILS) {
  throw new Error(
    'FATAL ERROR: ALLOWED_EMAILS is not defined — server would allow anyone to register'
  );
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('FATAL ERROR: STRIPE_SECRET_KEY is not defined in environment variables');
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    'FATAL ERROR: STRIPE_WEBHOOK_SECRET is not defined — webhook signature verification will fail for all events'
  );
}
if (!process.env.MONGODB_URL) {
  throw new Error('FATAL ERROR: MONGODB_URL is not defined in environment variables');
}

const app = express();
const port = process.env.BACKEND_PORT || process.env.PORT || 5000;

// Trust exactly one proxy hop (Heroku's router). Without this, express-rate-limit
// sees the load-balancer IP for every request, making rate limits per-proxy instead
// of per-client. It also ensures req.ip reflects the real client address.
app.set('trust proxy', 1);

await mongoose.connect(process.env.MONGODB_URL);
const auth = getAuth();

const db = mongoose.connection.getClient().db();

// Auto-expire passkey challenge verifications using MongoDB TTL index.
// better-auth sets expiresAt but never creates this index itself.
await db
  .collection('verification')
  .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });

// Scrub any OAuth tokens that may have been stored before the account hook was in place.
await db
  .collection('account')
  .updateMany(
    { accessToken: { $ne: null } },
    { $set: { accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null } }
  );

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const appDomain = process.env.APP_DOMAIN;
    if (!appDomain) return next();
    const proto = req.header('x-forwarded-proto');
    const host = req.header('host');
    if (proto !== 'https' || host !== appDomain) {
      return res.redirect(301, `https://${appDomain}${req.url}`);
    }
    next();
  });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://code.jquery.com',
          'https://cdn.jsdelivr.net',
          'https://js.stripe.com',
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: [
          "'self'",
          'https://api.stripe.com',
          'https://m.stripe.com',
          'https://m.stripe.network',
          'https://cdn.jsdelivr.net',
        ],
        frameSrc: ['https://js.stripe.com', 'https://m.stripe.com', 'https://m.stripe.network'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Webhook must receive raw body — before express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoute);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests, please try again later.' },
});

// better-auth handler must be before express.json()
app.use('/api/auth', authLimiter);
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/uploads', uploadRoute);
app.use('/api/email', emailRoute);
app.use('/api/gallery', galleryImageRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/about', aboutRoute);
app.use('/api/product-categories', productCategoryRoute);
app.use('/api/availability', availabilityRoute);
app.use('/api/bookings', bookingRoute);

app.use('/api/geo', geoRoute);

app.get('/api/config/stripe', (req, res) => {
  res.send(process.env.STRIPE_PUBLISHABLE_KEY || '');
});

app.get('/api/config/features', (req, res) => {
  res.json({
    bookingEnabled: process.env.ENABLE_BOOKING === 'true',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
  });
});

const __dirname = path.resolve();

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/frontend/build/index.html')));
} else {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.get('*', (_req, res) => res.redirect(frontendUrl));
}

Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).send({ message: 'Resource not found' });
  }
  console.error('Error:', err.message);
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}! 🚀`);
});
