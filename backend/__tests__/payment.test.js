import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { clearAuthCollections, createAdminSession } from './helpers/adminSession.js';

let app;
let adminCookie;

beforeAll(async () => {
  if (!process.env.STRIPE_TEST_SECRET_KEY) {
    console.warn('STRIPE_TEST_SECRET_KEY not set — skipping payment intent test');
    return;
  }
  const { createApp } = await import('../createApp.js');
  app = await createApp();
});

afterAll(async () => {
  if (app) await mongoose.disconnect();
});

beforeEach(async () => {
  if (!app) return;
  await clearAuthCollections();
  adminCookie = await createAdminSession();
  const { default: Booking } = await import('../models/bookingModel.js');
  await Booking.deleteMany({});
  const { default: Availability } = await import('../models/availabilityModel.js');
  await Availability.deleteMany({});
});

describe('Payment intent', () => {
  it('POST /api/bookings/:id/create-payment-intent returns clientSecret', async () => {
    if (!app) return;

    // Seed availability for a date 14 days from now
    const testDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const testDateStr = testDate.toISOString().split('T')[0];
    const { default: Availability } = await import('../models/availabilityModel.js');
    // price is top-level on Availability; slots only have time + isAvailable
    await Availability.create({ date: testDateStr, slots: [{ time: '10:00' }], price: 50 });

    // Create a booking
    const createRes = await request(app)
      .post('/api/bookings')
      .send({
        date: testDateStr,
        slot: '10:00',
        guestInfo: {
          name: 'Payment Test Guest',
          email: 'payment@test.com',
          phone: '+351920000000',
        },
      });
    expect(createRes.status).toBe(201);

    const bookingId = createRes.body._id;
    const confirmToken = createRes.body.confirmToken;

    const piRes = await request(app)
      .post(`/api/bookings/${bookingId}/create-payment-intent`)
      .send({ confirmToken });

    expect(piRes.status).toBe(200);
    expect(piRes.body).toHaveProperty('clientSecret');
    expect(piRes.body.clientSecret).toMatch(/^pi_.*_secret_/);
  });
});
