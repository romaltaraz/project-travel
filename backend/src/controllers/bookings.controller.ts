import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as bookingRepo from '../repositories/bookings.repository.js';
import * as vacationRepo from '../repositories/vacation.repository.js';
import { luhnCheck, validateExpiry, validateCvv } from '../utils/luhn.js';

const bookingSchema = z.object({
  numTravelers: z.number().int().min(1, 'At least 1 traveler required'),
  payment: z.object({
    cardNumber:     z.string().min(13).max(19),
    expiry:         z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY'),
    cvv:            z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
    cardholderName: z.string().min(1, 'Cardholder name is required'),
  }),
});

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const userId     = req.user!.id;
  const vacationId = parseInt(req.params.id);

  const vacation = await vacationRepo.findById(vacationId);
  if (!vacation) throw new AppError('Vacation not found', 404);

  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { numTravelers, payment } = parsed.data;

  // Validate payment details
  if (!luhnCheck(payment.cardNumber)) {
    throw new AppError('Invalid card number', 400);
  }
  if (!validateExpiry(payment.expiry)) {
    throw new AppError('Invalid or expired card', 400);
  }
  if (!validateCvv(payment.cvv)) {
    throw new AppError('Invalid CVV', 400);
  }

  const totalPrice = Math.round(vacation.price * numTravelers * 100) / 100;
  const booking = await bookingRepo.create(userId, vacationId, numTravelers, totalPrice);

  res.status(201).json({
    booking,
    vacation: { destination: vacation.destination, startDate: vacation.startDate, endDate: vacation.endDate },
    message: 'Booking confirmed!',
  });
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  const bookings = await bookingRepo.findByUser(req.user!.id);
  res.json(bookings);
}

export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  const userId    = req.user!.id;
  const bookingId = parseInt(req.params.id);

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.userId !== userId) throw new AppError('You can only cancel your own bookings', 403);
  if (booking.status === 'cancelled') throw new AppError('Booking is already cancelled', 400);

  // Fetch the vacation to check if it has already started
  const vacation = await vacationRepo.findById(booking.vacationId);
  if (vacation) {
    const today = new Date().toISOString().split('T')[0];
    if (vacation.startDate <= today) {
      throw new AppError('Cannot cancel a booking whose vacation has already started', 400);
    }
  }

  await bookingRepo.cancel(bookingId);
  res.json({ message: 'Booking cancelled successfully' });
}
