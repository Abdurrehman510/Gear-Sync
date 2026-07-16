import { z } from 'zod';

// MongoDB ObjectId Regex Helper
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const objectIdSchema = z.string().regex(objectIdRegex, {
  message: 'Invalid ID format',
});

// Register validation
export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).max(50),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.enum(['customer', 'mechanic', 'admin']).optional().default('customer'),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Service validation
export const serviceSchema = z.object({
  name: z.string().min(3, { message: 'Service name must be at least 3 characters long' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, { message: 'Price must be 0 or greater' })
  ),
  duration: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(10, { message: 'Duration must be at least 10 minutes' })
  ),
  category: z.string().min(2, { message: 'Category is required' }),
  image: z.string().optional().default('/assets/images/services-1.png'),
});

// Appointment validation
export const appointmentSchema = z.object({
  serviceId: objectIdSchema,
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).refine((val) => {
    // Strip hours/minutes from today and check if booking is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(val);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  }, {
    message: 'Booking date cannot be in the past',
  }),
  timeSlot: z.enum(['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], {
    message: 'Invalid slot. Choose: 09:00 AM, 11:00 AM, 02:00 PM, or 04:00 PM',
  }),
  notes: z.string().max(500, { message: 'Notes must not exceed 500 characters' }).optional(),
});

// Review validation
export const reviewSchema = z.object({
  serviceId: objectIdSchema,
  rating: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(1).max(5)
  ),
  comment: z.string().min(5, { message: 'Review comments must be at least 5 characters long' }).max(1000),
});
