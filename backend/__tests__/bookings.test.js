import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { clearAuthCollections, createAdminSession } from './helpers/adminSession.js';

let app;
let adminCookie;
let testDateStr; // YYYY-MM-DD

beforeAll(async () => {
  const { createApp } = await import('../createApp.js');
  app = await createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await clearAuthCollections();
  adminCookie = await createAdminSession(app);
  const { default: Booking } = await import('../models/bookingModel.js');
  const { default: Availability } = await import('../models/availabilityModel.js');
  await Booking.deleteMany({});
  await Availability.deleteMany({});

  // Create an availability record for the test date
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  testDateStr = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD
  await Availability.create({
    date: new Date(testDateStr + 'T00:00:00.000Z'),
    slots: [{ time: '14:00', isAvailable: true }],
    price: 100,
  });
});

const newBookingPayload = () => ({
  date: testDateStr,
  slot: '14:00',
  guestInfo: {
    name: 'Test Guest',
    email: 'guest@test.com',
    phone: '+351910000000',
  },
});

describe('Bookings', () => {
  it('POST /api/bookings creates a booking (public)', async () => {
    const res = await request(app).post('/api/bookings').send(newBookingPayload());
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('PENDING_PAYMENT');
  });

  it('created booking persists in DB', async () => {
    const res = await request(app).post('/api/bookings').send(newBookingPayload());
    const { default: Booking } = await import('../models/bookingModel.js');
    const found = await Booking.findById(res.body._id);
    expect(found).not.toBeNull();
    expect(found.guestInfo.email).toBe('guest@test.com');
  });

  it('GET /api/bookings returns booking list (admin)', async () => {
    await request(app).post('/api/bookings').send(newBookingPayload());
    const res = await request(app).get('/api/bookings').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body) ? res.body : (res.body.items ?? res.body.bookings ?? []);
    expect(items.length).toBeGreaterThan(0);
  });

  it('POST /api/bookings/:id/cancel cancels the booking (admin)', async () => {
    const create = await request(app).post('/api/bookings').send(newBookingPayload());
    const id = create.body._id;

    const cancel = await request(app).put(`/api/bookings/${id}/cancel`).set('Cookie', adminCookie);
    expect(cancel.status).toBe(200);
    expect(cancel.body.booking.status).toBe('CANCELED');
  });
});
