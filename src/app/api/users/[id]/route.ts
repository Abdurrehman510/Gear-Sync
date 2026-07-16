import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { objectIdSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// PUT: Modify user details/role (Admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Authorize Admin
    const adminUser = await getAuthenticatedUser(['admin']);
    if (!adminUser) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    // Validate ID format
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
    }

    // Prevent admin changing their own role (accidental lockout guard!)
    if (adminUser.userId === id) {
      return NextResponse.json({ message: 'Cannot modify your own administrative role' }, { status: 400 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !['customer', 'mechanic', 'admin'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role selection' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User account not found' }, { status: 404 });
    }

    logger.info(`Admin ${adminUser.email} changed role of user ${updatedUser.email} to ${role}`);

    return NextResponse.json(
      { message: 'User role updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error modifying user account', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// DELETE: Remove a user (Admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Authorize Admin
    const adminUser = await getAuthenticatedUser(['admin']);
    if (!adminUser) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    // Validate ID format
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
    }

    // Prevent deleting self
    if (adminUser.userId === id) {
      return NextResponse.json({ message: 'Cannot delete your own administrative account' }, { status: 400 });
    }

    await connectToDatabase();
    
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ message: 'User account not found' }, { status: 404 });
    }

    logger.info(`Admin ${adminUser.email} deleted user account: ${deletedUser.email}`);

    return NextResponse.json({ message: 'User account deleted successfully' }, { status: 200 });
  } catch (error: any) {
    logger.error('Error deleting user account', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
