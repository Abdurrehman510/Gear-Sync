import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET: Retrieve all users (Admin only)
export async function GET(req: Request) {
  try {
    const adminUser = await getAuthenticatedUser(['admin']);
    if (!adminUser) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    await connectToDatabase();

    let query: any = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).sort({ name: 1 });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching user accounts', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
