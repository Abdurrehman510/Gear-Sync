import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { serviceSchema, objectIdSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET: Retrieve a single service by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate ID format
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid service ID format' }, { status: 400 });
    }

    await connectToDatabase();
    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching service details', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// PUT: Update service (Admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Authorize Admin
    const user = await getAuthenticatedUser(['admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    // Validate ID format
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid service ID format' }, { status: 400 });
    }

    const body = await req.json();

    // 2. Validate update data
    const validation = serviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Update service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: validation.data },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    logger.info(`Admin ${user.email} updated service ID: ${id}`);
    return NextResponse.json({ message: 'Service updated successfully', service: updatedService }, { status: 200 });
  } catch (error: any) {
    logger.error('Error updating service', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// DELETE: Delete service (Admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Authorize Admin
    const user = await getAuthenticatedUser(['admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    // Validate ID format
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid service ID format' }, { status: 400 });
    }

    await connectToDatabase();

    // 2. Delete service
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    logger.info(`Admin ${user.email} deleted service ID: ${id} (${deletedService.name})`);
    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });
  } catch (error: any) {
    logger.error('Error deleting service', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
