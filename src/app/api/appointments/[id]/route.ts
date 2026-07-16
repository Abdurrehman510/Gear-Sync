import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { objectIdSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET: Retrieve a single appointment
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await getAuthenticatedUser(['customer', 'mechanic', 'admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid appointment ID format' }, { status: 400 });
    }

    await connectToDatabase();

    const appointment = await Appointment.findById(id)
      .populate('customer', 'name email')
      .populate('service', 'name price duration category image')
      .populate('mechanic', 'name email');

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    // Authorization check: Customer can only view their own
    if (user.role === 'customer' && appointment.customer._id.toString() !== user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Mechanics can only view assigned, unless admin
    if (user.role === 'mechanic' && appointment.mechanic?._id.toString() !== user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching appointment details', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// PUT: Update appointment (status change or mechanic assignment)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await getAuthenticatedUser(['customer', 'mechanic', 'admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid appointment ID format' }, { status: 400 });
    }

    const body = await req.json();
    const { status, mechanicId, notes } = body;

    await connectToDatabase();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    // 1. Customer cancellation constraint
    if (user.role === 'customer') {
      if (appointment.customer.toString() !== user.userId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      if (status === 'cancelled') {
        if (appointment.status === 'completed' || appointment.status === 'in-progress') {
          return NextResponse.json(
            { message: 'Cannot cancel an appointment that is already in progress or completed' },
            { status: 400 }
          );
        }
        appointment.status = 'cancelled';
        await appointment.save();
        logger.info(`Customer ${user.email} cancelled appointment ID: ${id}`);
        return NextResponse.json({ message: 'Appointment cancelled successfully', appointment }, { status: 200 });
      }

      return NextResponse.json({ message: 'Customers can only request cancellation' }, { status: 400 });
    }

    // 2. Admin & Mechanic status modification
    if (user.role === 'admin' || user.role === 'mechanic') {
      if (status) {
        const allowedStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
          return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }
        appointment.status = status;
      }

      // Admins can assign mechanics
      if (user.role === 'admin' && mechanicId !== undefined) {
        if (mechanicId === '') {
          appointment.mechanic = undefined;
        } else {
          const mechanicValidation = objectIdSchema.safeParse(mechanicId);
          if (!mechanicValidation.success) {
            return NextResponse.json({ message: 'Invalid mechanic ID format' }, { status: 400 });
          }
          appointment.mechanic = mechanicId;
        }
      }

      if (notes !== undefined) {
        appointment.notes = notes;
      }

      await appointment.save();
      logger.info(`${user.role.toUpperCase()} ${user.email} updated appointment ID: ${id} to status: ${status}`);
      return NextResponse.json({ message: 'Appointment updated successfully', appointment }, { status: 200 });
    }

    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  } catch (error: any) {
    logger.error('Error updating appointment', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// DELETE: Permanent deletion (Admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await getAuthenticatedUser(['admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid appointment ID format' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    logger.info(`Admin ${user.email} deleted appointment ID: ${id}`);
    return NextResponse.json({ message: 'Appointment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    logger.error('Error deleting appointment', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
