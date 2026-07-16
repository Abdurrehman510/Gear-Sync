import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { objectIdSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

const ALL_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');
    const dateStr = searchParams.get('date');

    // 1. Validation
    if (!serviceId || !dateStr) {
      return NextResponse.json({ message: 'Missing serviceId or date query parameter' }, { status: 400 });
    }

    const idValidation = objectIdSchema.safeParse(serviceId);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid service ID format' }, { status: 400 });
    }

    if (isNaN(Date.parse(dateStr))) {
      return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }

    const searchDate = new Date(dateStr);
    searchDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (searchDate < today) {
      return NextResponse.json({ slots: ALL_SLOTS.map(slot => ({ slot, available: false })) }, { status: 200 });
    }

    await connectToDatabase();

    // 2. Query active appointments for that service and date
    // Active means status is NOT cancelled
    const startOfDay = new Date(searchDate);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      service: serviceId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    });

    const bookedSlots = bookedAppointments.map((appt) => appt.timeSlot);

    // 3. Evaluate each slot
    const slotsWithAvailability = ALL_SLOTS.map((slot) => {
      let available = !bookedSlots.includes(slot);

      // If booking for today, make sure the time slot has not passed
      if (available && searchDate.getTime() === today.getTime()) {
        const [timePart, ampm] = slot.split(' ');
        const [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        // Add 1 hour buffer for same-day bookings
        if (slotTime.getTime() <= now.getTime() + 60 * 60 * 1000) {
          available = false;
        }
      }

      return {
        slot,
        available,
      };
    });

    return NextResponse.json({ slots: slotsWithAvailability }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching available booking slots', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
