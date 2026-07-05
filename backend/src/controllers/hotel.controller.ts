import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as hotelRepo from '../repositories/hotel.repository.js';

export async function getHotels(req: AuthRequest, res: Response): Promise<void> {
  const hotels = await hotelRepo.findAll(req.user?.id ?? 0);
  res.json(hotels);
}

export async function likeHotel(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const hotelId = parseInt(req.params.id);
  if (isNaN(hotelId)) throw new AppError('Invalid hotel id', 400);

  const exists = await hotelRepo.findById(hotelId);
  if (!exists) throw new AppError('Hotel not found', 404);

  const alreadyLiked = await hotelRepo.getLike(userId, hotelId);
  if (alreadyLiked) throw new AppError('You already liked this hotel', 409);

  await hotelRepo.addLike(userId, hotelId);
  const updated = await hotelRepo.findById(hotelId, userId);
  res.json(updated);
}

export async function unlikeHotel(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const hotelId = parseInt(req.params.id);
  if (isNaN(hotelId)) throw new AppError('Invalid hotel id', 400);

  const exists = await hotelRepo.findById(hotelId);
  if (!exists) throw new AppError('Hotel not found', 404);

  await hotelRepo.removeLike(userId, hotelId);
  const updated = await hotelRepo.findById(hotelId, userId);
  res.json(updated);
}
