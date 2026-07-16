import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import Service from '@/lib/models/Service';
import { appointmentSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET: Retrieve appointments based on role
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(['customer', 'mechanic', 'admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Parse search filters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query: any = {};

    // Apply role scoping
    if (user.role === 'customer') {
      query.customer = user.userId;
    } else if (user.role === 'mechanic') {
      query.mechanic = user.userId;
    }

    // Apply status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Find and populate
    const appointments = await Appointment.find(query)
      .populate('customer', 'name email')
      .populate('service', 'name price duration category image')
      .populate('mechanic', 'name email')
      .sort({ date: 1, timeSlot: 1 });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching appointments', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// POST: Book a new appointment
export async function POST(req: Request) {
  try {
    // 1. Authenticate user (Any logged in user can book, default role is customer)
    const user = await getAuthenticatedUser(['customer', 'mechanic', 'admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please login to book an appointment.' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Schema Validation
    const validation = appointmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { serviceId, date, timeSlot, notes } = validation.data;
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    await connectToDatabase();

    // 3. Confirm Service Exists
    const serviceObj = await Service.findById(serviceId);
    if (!serviceObj) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    // 4. Double-Booking Guard
    const startOfDay = new Date(bookingDate);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Appointment.findOne({
      service: serviceId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: 'This time slot is already booked for this service' },
        { status: 400 }
      );
    }

    // 5. Create booking
    const newAppointment = await Appointment.create({
      customer: user.userId,
      service: serviceId,
      date: bookingDate,
      timeSlot,
      notes,
      status: 'pending',
    });

    // Populate service for returning
    const populated = await newAppointment.populate('service', 'name price duration image');

    logger.info(`Customer ${user.email} booked service: ${serviceObj.name} for ${date} at ${timeSlot}`);

    return NextResponse.json(
      { message: 'Appointment booked successfully', appointment: populated },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error creating appointment', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
