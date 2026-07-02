import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as reviewRepo from '../repositories/reviews.repository.js';
import * as vacationRepo from '../repositories/vacation.repository.js';

const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
  const vacationId = parseInt(req.params.id);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);

  const { reviews, total } = await reviewRepo.findByVacation(vacationId, page, 10);
  res.json({ reviews, total, page });
}

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  const userId    = req.user!.id;
  const vacationId = parseInt(req.params.id);

  const vacation = await vacationRepo.findById(vacationId);
  if (!vacation) throw new AppError('Vacation not found', 404);

  const existing = await reviewRepo.findByUserAndVacation(userId, vacationId);
  if (existing) {
    throw new AppError(
      'You already have a review for this vacation. Use PUT /api/reviews/:id to edit it.',
      409,
    );
  }

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const review = await reviewRepo.create(userId, vacationId, parsed.data.rating, parsed.data.comment);
  const avgRating = await reviewRepo.getAverageRating(vacationId);
  res.status(201).json({ review, avgRating });
}

export async function updateReview(req: AuthRequest, res: Response): Promise<void> {
  const userId   = req.user!.id;
  const reviewId = parseInt(req.params.id);

  const review = await reviewRepo.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  // Users may only edit their own reviews
  if (review.userId !== userId && req.user?.role !== 'admin') {
    throw new AppError('You can only edit your own reviews', 403);
  }

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  await reviewRepo.update(reviewId, parsed.data.rating, parsed.data.comment);
  const avgRating = await reviewRepo.getAverageRating(review.vacationId);
  res.json({ message: 'Review updated', avgRating });
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
  const userId   = req.user!.id;
  const reviewId = parseInt(req.params.id);

  const review = await reviewRepo.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  // Users delete own; admins delete any
  if (review.userId !== userId && req.user?.role !== 'admin') {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await reviewRepo.remove(reviewId);
  const avgRating = await reviewRepo.getAverageRating(review.vacationId);
  res.json({ message: 'Review deleted', avgRating });
}
