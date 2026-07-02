import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as bookingRepo   from '../repositories/bookings.repository.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';

const updateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled']),
});

export async function adminGetBookings(req: AuthRequest, res: Response): Promise<void> {
  const status   = req.query.status   as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo   = req.query.dateTo   as string | undefined;
  const bookings = await bookingRepo.adminFindAll({ status, dateFrom, dateTo });
  res.json(bookings);
}

export async function adminUpdateBooking(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const booking = await bookingRepo.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);

  const parsed = updateBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  await bookingRepo.adminUpdate(id, parsed.data.status);
  res.json({ message: 'Booking updated', id, status: parsed.data.status });
}

// ---------------------------------------------------------------------------
// Analytics endpoints (admin only)
// ---------------------------------------------------------------------------

export async function analyticsOverview(_req: AuthRequest, res: Response): Promise<void> {
  const overview = await analyticsRepo.getOverview();
  res.json(overview);
}

export async function analyticsRevenueByMonth(_req: AuthRequest, res: Response): Promise<void> {
  const data = await analyticsRepo.getRevenueByMonth();
  res.json(data);
}

export async function analyticsPopularVacations(_req: AuthRequest, res: Response): Promise<void> {
  const data = await analyticsRepo.getPopularVacations();
  res.json(data);
}
