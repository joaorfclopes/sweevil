import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAdmin, isAuth } from '../utils.js';

const VALID_PERIODS = new Set(['1h', '24h', '7d', '14d', '30d']);

const analyticsRouter = express.Router();

analyticsRouter.get(
  '/visitors',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const period = req.query.period ?? '7d';

    if (!VALID_PERIODS.has(period)) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_BASE_URL } = process.env;

    if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_BASE_URL) {
      return res.status(503).json({ error: 'Sentry not configured' });
    }

    const url = new URL(`${SENTRY_BASE_URL}/api/0/organizations/${SENTRY_ORG}/events/`);
    url.searchParams.set('dataset', 'spans');
    url.searchParams.set('field', 'count_unique(user.ip)');
    url.searchParams.set('per_page', '50');
    url.searchParams.set('project', '-1');
    url.searchParams.set('query', 'platform:javascript');
    url.searchParams.set('statsPeriod', period);
    url.searchParams.set('sort', '-count_unique_user_ip');
    url.searchParams.set('sampling', 'NORMAL');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Sentry request failed' });
    }

    const data = await response.json();
    const count = data?.data?.[0]?.['count_unique(user.ip)'] ?? 0;
    res.json({ count });
  })
);

export default analyticsRouter;
