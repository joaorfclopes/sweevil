import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});
