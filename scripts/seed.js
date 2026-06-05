import crypto from 'crypto';
import 'dotenv/config';
import { readFile } from 'fs/promises';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import About from '../backend/models/aboutModel.js';
import Availability from '../backend/models/availabilityModel.js';
import Booking from '../backend/models/bookingModel.js';
import Category from '../backend/models/categoryModel.js';
import GalleryImage from '../backend/models/galleryImageModel.js';
import Order from '../backend/models/orderModel.js';
import ProductCategory from '../backend/models/productCategoryModel.js';
import Product from '../backend/models/productModel.js';
import User from '../backend/models/userModel.js';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

const url = process.env.MONGODB_URL;
if (!url) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1|mongo:27017/.test(url);
const hasForce = process.argv.includes('--force');

if (!isLocal) {
  console.error('ERROR: MONGODB_URL does not look like a local DB.');
  console.error('Refusing to wipe a non-local database.');
  console.error('If you really mean it, pass --force (local URLs only).');
  process.exit(1);
}

if (!hasForce) {
  console.error('ERROR: seed will wipe all collections. Pass --force to confirm.');
  console.error('  node scripts/seed.js --force');
  process.exit(1);
}

async function loadJSON(file) {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8'));
  } catch {
    console.warn(`  scripts/data/${file} not found — skipping`);
    return null;
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const CUSTOMERS = [
  {
    fullName: 'Ana Silva',
    email: 'ana.silva@example.com',
    phoneNumber: '+351912345678',
    address: 'Rua Augusta 10',
    city: 'Lisboa',
    postalCode: '1100-048',
    country: 'PT',
  },
  {
    fullName: 'João Costa',
    email: 'joao.costa@example.com',
    phoneNumber: '+351963214567',
    address: 'Rua Santa Catarina 5',
    city: 'Porto',
    postalCode: '4000-450',
    country: 'PT',
  },
  {
    fullName: 'Maria Ferreira',
    email: 'maria.ferreira@example.com',
    phoneNumber: '+351931234567',
    address: 'Avenida Central 22',
    city: 'Braga',
    postalCode: '4710-229',
    country: 'PT',
  },
  {
    fullName: 'Pedro Rodrigues',
    email: 'pedro.rodrigues@example.com',
    phoneNumber: '+351961111222',
    address: 'Rua Direita 3',
    city: 'Coimbra',
    postalCode: '3000-100',
    country: 'PT',
  },
  {
    fullName: 'Sofia Alves',
    email: 'sofia.alves@example.com',
    phoneNumber: '+351919876543',
    address: 'Largo da Sé 1',
    city: 'Évora',
    postalCode: '7000-500',
    country: 'PT',
  },
];

const BOOKING_GUESTS = [
  {
    name: 'Beatriz Lopes',
    email: 'beatriz@example.com',
    phone: '+351910001111',
    notes: 'Preferência pela manhã',
  },
  { name: 'Tiago Mendes', email: 'tiago@example.com', phone: '+351920002222', notes: '' },
  {
    name: 'Inês Santos',
    email: 'ines@example.com',
    phone: '+351930003333',
    notes: 'Sessão de grupo de 3 pessoas',
  },
  { name: 'Rui Oliveira', email: 'rui@example.com', phone: '+351940004444', notes: '' },
  {
    name: 'Catarina Nunes',
    email: 'catarina@example.com',
    phone: '+351950005555',
    notes: 'Primeira vez no estúdio',
  },
];

const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

console.log('Connecting to DB…');
await mongoose.connect(url);

// ── Clear ──────────────────────────────────────────────────────────────────
console.log('Clearing existing data…');
await Promise.all([
  User.deleteMany({}),
  Category.deleteMany({}),
  ProductCategory.deleteMany({}),
  Product.deleteMany({}),
  About.deleteMany({}),
  GalleryImage.deleteMany({}),
  Order.deleteMany({}),
  Booking.deleteMany({}),
  Availability.deleteMany({}),
]);

// ── Categories & ProductCategories ────────────────────────────────────────
const categoriesData = await loadJSON('categories.json');
const productCategoriesData = await loadJSON('productCategories.json');

if (categoriesData) {
  await Category.insertMany(categoriesData.map(({ _id, ...rest }) => rest));
  console.log(`  Inserted ${categoriesData.length} categories`);
}
if (productCategoriesData) {
  await ProductCategory.insertMany(productCategoriesData.map(({ _id, ...rest }) => rest));
  console.log(`  Inserted ${productCategoriesData.length} productCategories`);
}

// ── Products ──────────────────────────────────────────────────────────────
const productsData = await loadJSON('products.json');
let insertedProducts = [];
if (productsData) {
  insertedProducts = await Product.insertMany(
    productsData.map(({ _id, __v, ...rest }, i) => ({ ...rest, sortOrder: i, slug: nanoid(12) }))
  );
  console.log(`  Inserted ${insertedProducts.length} products`);
}

// ── About ─────────────────────────────────────────────────────────────────
const aboutData = await loadJSON('about.json');
if (aboutData?.length) {
  await About.insertMany(aboutData.map(({ _id, __v, ...rest }) => rest));
  console.log(`  Inserted ${aboutData.length} about doc(s)`);
} else {
  await About.create({ title: "Who's Sweevil?", body: 'Dev placeholder — edit in admin panel.' });
  console.log('  Inserted placeholder about doc');
}

// ── Gallery ───────────────────────────────────────────────────────────────
const galleryData = await loadJSON('galleryImages.json');
if (galleryData?.length) {
  await GalleryImage.insertMany(galleryData.map(({ _id, __v, ...rest }) => rest));
  console.log(`  Inserted ${galleryData.length} gallery images`);
}

// ── Availabilities ────────────────────────────────────────────────────────
const ALL_SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
const availabilities = [];
for (let i = -30; i <= 60; i++) {
  const date = i >= 0 ? daysFromNow(i) : daysAgo(-i);
  date.setHours(0, 0, 0, 0);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) continue; // closed Sundays
  const price = 150;
  const slots = ALL_SLOTS.map((time) => ({
    time,
    isAvailable: Math.random() > 0.3, // ~70% available
  }));
  availabilities.push({ date, slots, price });
}
await Availability.insertMany(availabilities);
console.log(`  Inserted ${availabilities.length} availabilities`);

// ── Orders ────────────────────────────────────────────────────────────────
if (insertedProducts.length === 0) {
  console.log('  No products — skipping mock orders');
} else {
  const STATUSES = [
    'PENDING',
    'PAID',
    'SENT',
    'DELIVERED',
    'CANCELED_REFUNDED',
    'CANCELED_NO_REFUND',
    'CANCELED_PENDING_REFUND',
  ];
  const orders = [];

  for (let i = 0; i < 30; i++) {
    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const status = STATUSES[i % STATUSES.length];
    const product = insertedProducts[i % insertedProducts.length];
    const qty = (i % 3) + 1;
    const itemsPrice = +(product.price * qty).toFixed(2);
    const shippingPrice = itemsPrice >= 50 ? 0 : 3.99;
    const totalPrice = +(itemsPrice + shippingPrice).toFixed(2);
    const isPaid = [
      'PAID',
      'SENT',
      'DELIVERED',
      'CANCELED_REFUNDED',
      'CANCELED_PENDING_REFUND',
    ].includes(status);
    const isRefunded = status === 'CANCELED_REFUNDED';
    const paidAt = isPaid ? daysAgo(20 - i) : undefined;
    const isDelivered = status === 'DELIVERED';
    const deliveredAt = isDelivered ? daysAgo(10 - (i % 5)) : undefined;

    const confirmToken = crypto.randomBytes(32).toString('hex');
    const confirmTokenExpiresAt = isDelivered
      ? new Date(deliveredAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : undefined;
    const seedPaymentMethod = Math.random() < 0.5 ? 'card' : 'mb_way';

    orders.push({
      orderItems: [
        {
          name: product.name,
          qty,
          size: product.isClothing ? ['XS', 'S', 'M', 'L', 'XL'][i % 5] : undefined,
          image: product.images?.[0] ?? '',
          price: product.price,
          product: product._id,
          slug: product.slug,
        },
      ],
      shippingDetails: { ...customer },
      billingDetails: { ...customer },
      itemsQty: qty,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      ...(isPaid && {
        paymentResult: {
          id: `pi_seed_${i}`,
          status: 'succeeded',
          paymentMethod: seedPaymentMethod,
        },
      }),
      isRefunded,
      isDelivered,
      deliveredAt,
      status,
      confirmToken,
      confirmTokenExpiresAt,
      confirmationEmailSent: isPaid,
      createdAt: daysAgo(30 - i),
      updatedAt: daysAgo(28 - i),
    });
  }

  await Order.insertMany(orders);
  console.log(`  Inserted ${orders.length} mock orders`);
}

// ── Bookings ──────────────────────────────────────────────────────────────
const bookings = [];
const usedSlots = new Set();

const bookingDefs = [
  // past confirmed
  { daysOffset: -30, slot: 0, status: 'CONFIRMED', isPaid: true },
  { daysOffset: -25, slot: 1, status: 'CONFIRMED', isPaid: true },
  { daysOffset: -20, slot: 2, status: 'CONFIRMED', isPaid: true },
  { daysOffset: -15, slot: 0, status: 'CANCELED', isPaid: false },
  { daysOffset: -10, slot: 1, status: 'CANCELED', isPaid: false },
  { daysOffset: -7, slot: 2, status: 'CONFIRMED', isPaid: true },
  { daysOffset: -5, slot: 3, status: 'CONFIRMED', isPaid: true },
  { daysOffset: -3, slot: 4, status: 'CONFIRMED', isPaid: true },
  // upcoming
  { daysOffset: 3, slot: 0, status: 'CONFIRMED', isPaid: true },
  { daysOffset: 7, slot: 1, status: 'CONFIRMED', isPaid: true },
  { daysOffset: 10, slot: 2, status: 'PENDING_PAYMENT', isPaid: false },
  { daysOffset: 14, slot: 3, status: 'CONFIRMED', isPaid: true },
  { daysOffset: 21, slot: 0, status: 'PENDING_PAYMENT', isPaid: false },
];

for (let i = 0; i < bookingDefs.length; i++) {
  const def = bookingDefs[i];
  const date = def.daysOffset >= 0 ? daysFromNow(def.daysOffset) : daysAgo(-def.daysOffset);
  date.setHours(0, 0, 0, 0);
  const slot = SLOTS[def.slot];
  const key = `${date.toISOString()}_${slot}`;

  if (usedSlots.has(key) && ['PENDING_PAYMENT', 'CONFIRMED'].includes(def.status)) continue;
  if (['PENDING_PAYMENT', 'CONFIRMED'].includes(def.status)) usedSlots.add(key);

  const guest = BOOKING_GUESTS[i % BOOKING_GUESTS.length];
  const paidAt = def.isPaid ? new Date(date.getTime() - 86400000) : undefined;

  bookings.push({
    date,
    slot,
    price: 150,
    guestInfo: guest,
    status: def.status,
    isPaid: def.isPaid,
    paidAt,
    confirmationEmailSent: def.isPaid,
    createdAt: new Date(date.getTime() - 86400000 * 2),
    updatedAt: new Date(date.getTime() - 86400000),
  });
}

await Booking.insertMany(bookings);
console.log(`  Inserted ${bookings.length} mock bookings`);

console.log('\nDone.');
await mongoose.disconnect();
