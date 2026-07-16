import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    await clearAuthCookie();
    logger.info('User logged out successfully');
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Logout error occurred', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
