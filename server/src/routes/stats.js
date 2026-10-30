import { Router } from 'express';
import Client from '../models/Client.js';
import Booking from '../models/Booking.js';
import StaffMember from '../models/StaffMember.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalClients, totalBookings, totalStaff] = await Promise.all([
      Client.countDocuments(),
      Booking.countDocuments(),
      StaffMember.countDocuments({ active: true }),
    ]);

    const bookings = await Booking.find().populate('pkg', 'price');

    const upcoming = bookings
      .filter((b) => new Date(b.date) >= now && b.status !== 'cancelled' && b.status !== 'completed')
      .sort((a, b) => a.date - b.date);

    const revenueThisMonth = bookings
      .filter(
        (b) =>
          b.status === 'completed' &&
          new Date(b.date) >= monthStart &&
          new Date(b.date) < monthEnd
      )
      .reduce((sum, b) => sum + (b.pkg?.price ?? 0), 0);

    const revenueTotal = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.pkg?.price ?? 0), 0);

    // Bookings per weekday (Mon..Sun) for the last 4 weeks — feeds the client chart
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 3600 * 1000);
    for (const b of bookings) {
      const d = new Date(b.date);
      if (d >= fourWeeksAgo && d <= now && b.status !== 'cancelled') {
        weekdayCounts[(d.getDay() + 6) % 7]++;
      }
    }

    res.json({
      totalClients,
      totalBookings,
      totalStaff,
      upcomingCount: upcoming.length,
      revenueThisMonth,
      revenueTotal,
      weekdayCounts,
    });
  } catch (e) { next(e); }
});

export default router;
