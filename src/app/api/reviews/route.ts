import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/lib/models/Review';
import Appointment from '@/lib/models/Appointment';
import { reviewSchema, objectIdSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET: Retrieve reviews for a service (with query ?serviceId=xxx)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ message: 'Missing serviceId query parameter' }, { status: 400 });
    }

    const idValidation = objectIdSchema.safeParse(serviceId);
    if (!idValidation.success) {
      return NextResponse.json({ message: 'Invalid service ID format' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Fetch reviews
    const reviews = await Review.find({ service: serviceId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    // 2. Calculate aggregate statistics
    const stats = await Review.aggregate([
      { $match: { service: new Object(serviceId) } }, // Aggregates need MongoDB ObjectId
      {
        $group: {
          _id: '$service',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // If no reviews yet
    const averageRating = stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 0;
    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

    return NextResponse.json(
      {
        reviews,
        stats: {
          averageRating,
          totalReviews,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error fetching reviews', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// POST: Add feedback review (requires completed service booking)
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser(['customer', 'mechanic', 'admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please login to review.' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Validate input
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { serviceId, rating, comment } = validation.data;

    await connectToDatabase();

    // 3. Verified Buyer/Booker Check
    // Verify the customer has at least one 'completed' appointment for this service
    const completedAppointment = await Appointment.findOne({
      customer: user.userId,
      service: serviceId,
      status: 'completed',
    });

    if (!completedAppointment) {
      return NextResponse.json(
        { message: 'Only customers who have completed a booking for this service can leave reviews.' },
        { status: 403 }
      );
    }

    // 4. Check if user already reviewed this service (limit to 1 review per service per customer)
    const existingReview = await Review.findOne({
      customer: user.userId,
      service: serviceId,
    });

    if (existingReview) {
      // Allow updating existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.createdAt = new Date();
      await existingReview.save();
      logger.info(`User ${user.email} updated review for service: ${serviceId}`);
      return NextResponse.json(
        { message: 'Review updated successfully', review: existingReview },
        { status: 200 }
      );
    }

    // 5. Create new review
    const newReview = await Review.create({
      customer: user.userId,
      service: serviceId,
      rating,
      comment,
    });

    logger.info(`User ${user.email} added review for service: ${serviceId}`);

    return NextResponse.json(
      { message: 'Review posted successfully', review: newReview },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error posting review', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
