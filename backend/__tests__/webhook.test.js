import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import request from 'supertest';

let app;

beforeAll(async () => {
  const { createApp } = await import('../createApp.js');
  app = await createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
});

const WEBHOOK_SECRET = 'whsec_test_webhook_secret_for_tests_only';

function makeStripeEvent(type, payload) {
  return {
    id: 'evt_test_123',
    object: 'event',
    type,
    data: { object: payload },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  };
}

describe('Webhook', () => {
  it('returns 400 when stripe-signature is missing', async () => {
    const body = JSON.stringify(makeStripeEvent('payment_intent.succeeded', {}));
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .send(Buffer.from(body));
    expect(res.status).toBe(400);
  });

  it('returns 400 when stripe-signature is invalid', async () => {
    const body = JSON.stringify(makeStripeEvent('payment_intent.succeeded', {}));
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'invalid-sig')
      .send(Buffer.from(body));
    expect(res.status).toBe(400);
  });

  it('returns 200 with received:true when signature is valid', async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = makeStripeEvent('payment_intent.payment_failed', {
      id: 'pi_test_123',
      metadata: {},
      last_payment_error: { message: 'Test failure' },
    });
    const body = JSON.stringify(event);
    const sig = stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: WEBHOOK_SECRET,
    });

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', sig)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });
});
