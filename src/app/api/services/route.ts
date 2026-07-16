import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { serviceSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Standard seed services
const seedServices = [
  {
    name: 'Engine Repair',
    description: 'Expert diagnostics, tune-ups, component replacement, and overhaul repairs to keep your engine running at peak efficiency.',
    price: 250,
    duration: 120,
    category: 'Engine',
    image: '/assets/images/services-1.png',
  },
  {
    name: 'Brake Repair',
    description: 'Ensure your driving safety with professional brake rotor resurfacing, brake pad replacement, and brake fluid line flushing.',
    price: 120,
    duration: 60,
    category: 'Brakes',
    image: '/assets/images/services-2.png',
  },
  {
    name: 'Tire Repair & Balancing',
    description: 'From tire punctures and patches to wheel rotation, balancing, and full set replacements for safe all-weather traction.',
    price: 80,
    duration: 45,
    category: 'Tires',
    image: '/assets/images/services-3.png',
  },
  {
    name: 'Battery Diagnostics & Repair',
    description: 'Fast and efficient battery health diagnostics, alternator checkups, terminal cleaning, and battery replacements with premium brand units.',
    price: 95,
    duration: 30,
    category: 'Battery',
    image: '/assets/images/services-4.png',
  },
  {
    name: 'Steering & Suspension Repair',
    description: 'Precision steering system diagnostics, shock absorber replacements, and steering rack adjustments for stable vehicle handling.',
    price: 150,
    duration: 90,
    category: 'Steering',
    image: '/assets/images/services-6.png',
  },
];

// GET: Fetch all services (with auto-seed if empty)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Parse search parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let services = await Service.find({});

    // Seed if empty
    if (services.length === 0) {
      logger.info('No services found in database. Seeding default services...');
      await Service.insertMany(seedServices);
      services = await Service.find({});
    }

    // Apply filtering in memory or through query (for simple operations, query-based is fine)
    let query: any = {};
    if (category && category !== 'All') {
      query.category = new RegExp(category, 'i');
    }
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const filteredServices = await Service.find(query).sort({ name: 1 });

    return NextResponse.json({ services: filteredServices }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching services', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

// POST: Add new service (Admin only)
export async function POST(req: Request) {
  try {
    // 1. Authorize Admin
    const user = await getAuthenticatedUser(['admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    const body = await req.json();

    // 2. Validate input
    const validation = serviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Check for duplicates
    const existingService = await Service.findOne({ name: validation.data.name });
    if (existingService) {
      return NextResponse.json(
        { message: 'A service with this name already exists' },
        { status: 400 }
      );
    }

    // 4. Create service
    const newService = await Service.create(validation.data);
    logger.info(`Admin ${user.email} created service: ${newService.name}`);

    return NextResponse.json(
      { message: 'Service created successfully', service: newService },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error creating service', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
