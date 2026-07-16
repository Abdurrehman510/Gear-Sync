import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { loginSchema } from '@/lib/validation';
import { comparePassword, setAuthCookie } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 2. Database Connection
    await connectToDatabase();

    // 3. Find User (explicitly select password)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    // 4. Compare Password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    // 5. Create token and set HTTP-only cookie
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    await setAuthCookie(payload);

    logger.info(`User logged in: ${email}`);

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Login error occurred', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
