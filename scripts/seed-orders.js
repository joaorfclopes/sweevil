import crypto from 'crypto';
import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../backend/models/orderModel.js';
import Product from '../backend/models/productModel.js';

const url = process.env.MONGODB_URL;
if (!url) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1|mongo:27017/.test(url);
if (!isLocal) {
  console.error('ERROR: MONGODB_URL does not look like a local DB. Refusing.');
  process.exit(1);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
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

const STATUSES = [
  'PENDING',
  'PAID',
  'SENT',
  'DELIVERED',
  'CANCELED_REFUNDED',
  'CANCELED_NO_REFUND',
  'CANCELED_PENDING_REFUND',
];

await mongoose.connect(url);

const products = await Product.find({}).lean();
if (products.length === 0) {
  console.error('No products found — run the full seed first.');
  await mongoose.disconnect();
  process.exit(1);
}

console.log('Deleting existing orders…');
await Order.deleteMany({});

const orders = [];

for (let i = 0; i < 30; i++) {
  const customer = CUSTOMERS[i % CUSTOMERS.length];
  const status = STATUSES[i % STATUSES.length];
  const product = products[i % products.length];
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
console.log(`Inserted ${orders.length} mock orders`);

await mongoose.disconnect();
