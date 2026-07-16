import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import Service from '@/lib/models/Service';
import User from '@/lib/models/User';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // 1. Authorize Admin
    const user = await getAuthenticatedUser(['admin']);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Administrator access required.' }, { status: 403 });
    }

    await connectToDatabase();

    // 2. Count metrics
    const totalAppointments = await Appointment.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalMechanics = await User.countDocuments({ role: 'mechanic' });

    // 3. Aggregate Status Distribution
    const statusCounts = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = {
      pending: 0,
      confirmed: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
    };
    statusCounts.forEach((item) => {
      if (item._id in statusDistribution) {
        statusDistribution[item._id as keyof typeof statusDistribution] = item.count;
      }
    });

    // 4. Calculate Total Revenue from Completed Appointments
    // Since service holds the price, we populate or aggregate.
    // Populate is safer/cleaner, or we can use a lookup in aggregation. Let's do a populated sum.
    const completedAppointments = await Appointment.find({ status: 'completed' })
      .populate('service', 'price');
    
    const totalRevenue = completedAppointments.reduce((sum, appt: any) => {
      return sum + (appt.service?.price || 0);
    }, 0);

    // 5. Popular Services (Top 3)
    const popularServicesAgg = await Appointment.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // Populate service names for popular services
    const popularServices = await Promise.all(
      popularServicesAgg.map(async (item) => {
        const service = await Service.findById(item._id).select('name category');
        return {
          name: service ? service.name : 'Unknown Service',
          category: service ? service.category : 'N/A',
          bookingsCount: item.count,
        };
      })
    );

    // 6. Recent bookings (Last 5)
    const recentAppointments = await Appointment.find({})
      .populate('customer', 'name email')
      .populate('service', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(
      {
        stats: {
          totalAppointments,
          totalCustomers,
          totalMechanics,
          totalRevenue,
          statusDistribution,
          popularServices,
        },
        recentAppointments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error generating administrative statistics', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
