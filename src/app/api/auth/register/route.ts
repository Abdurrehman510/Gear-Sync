import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { registerSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Zod Validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // 2. Database Connection
    await connectToDatabase();

    // 3. Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email address already exists' },
        { status: 400 }
      );
    }

    // 4. Hash password
    const hashedPassword = await hashPassword(password);

    // 5. Create user
    // First user is automatically made admin for setup purposes, or standard role
    const usersCount = await User.countDocuments();
    const assignedRole = usersCount === 0 ? 'admin' : role || 'customer';

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    logger.info(`User registered successfully: ${email} with role: ${assignedRole}`);

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Registration error occurred', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
