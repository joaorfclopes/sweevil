import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  next();
};

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const createBookingSchema = z.object({
  date: z.string().refine((d) => !isNaN(Date.parse(d)) && new Date(d) > new Date(), {
    message: 'Date must be a valid future date',
  }),
  slot: z.string().min(1),
  guestInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    notes: z.string().optional(),
  }),
  images: z.array(z.string()).max(10).optional().default([]),
});

const shippingAddressSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  phoneNumber: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2),
});

const orderItemSchema = z.object({
  product: mongoId,
  qty: z.number().int().positive(),
  size: z.string().optional(),
});

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, 'Cart is empty'),
  shippingAddress: shippingAddressSchema,
});

const coerceStock = z.coerce.number().int().min(0).optional();

const countInStockSchema = z.object({
  stock: coerceStock,
  xs: coerceStock,
  s: coerceStock,
  m: coerceStock,
  l: coerceStock,
  xl: coerceStock,
  xxl: coerceStock,
});

export const productSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  images: z.array(z.string()).optional(),
  category: z.string().min(1),
  isClothing: z.boolean(),
  countInStock: countInStockSchema,
  description: z.string().optional(),
  visible: z.boolean(),
});
