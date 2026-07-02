import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as vacationRepo from '../repositories/vacation.repository.js';
import * as adminRepo from '../repositories/admin.repository.js';
import fs from 'fs';
import path from 'path';

const PAGE_SIZE = 9;

const vacationSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  description: z.string().min(1, 'Description is required'),
  startDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
  price:       z.coerce.number().gt(0).lte(10000, 'Price must be between 0 and 10,000'),
});

export async function getVacations(req: AuthRequest, res: Response): Promise<void> {
  const page      = Math.max(1, parseInt(req.query.page as string) || 1);
  const likedOnly     = req.query.likedOnly     === 'true';
  const activeOnly    = req.query.activeOnly    === 'true';
  const notStartedOnly = req.query.notStartedOnly === 'true';
  const userId = req.user?.id ?? 0;

  const { vacations, total } = await vacationRepo.findAll(
    { likedOnly, activeOnly, notStartedOnly, userId },
    page,
    PAGE_SIZE,
  );

  res.json({
    vacations,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

export async function getVacationById(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const vacation = await vacationRepo.findById(id, req.user?.id);
  if (!vacation) throw new AppError('Vacation not found', 404);
  res.json(vacation);
}

export async function createVacation(req: AuthRequest, res: Response): Promise<void> {
  const parsed = vacationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { destination, description, startDate, endDate, price } = parsed.data;

  if (new Date(startDate) < new Date(new Date().toISOString().split('T')[0])) {
    throw new AppError('Start date cannot be in the past');
  }
  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError('End date must be on or after start date');
  }

  if (!req.file) throw new AppError('Vacation image is required');
  const imageFileName = req.file.filename;

  const id = await vacationRepo.create({ destination, description, startDate, endDate, price, imageFileName });
  const created = await vacationRepo.findById(id, req.user?.id);
  res.status(201).json(created);
}

export async function updateVacation(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const existing = await vacationRepo.findById(id);
  if (!existing) throw new AppError('Vacation not found', 404);

  const parsed = vacationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { destination, description, startDate, endDate, price } = parsed.data;

  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError('End date must be on or after start date');
  }

  // If a new image was uploaded, delete the old file
  let imageFileName = existing.imageFileName;
  if (req.file) {
    const oldPath = path.join(__dirname, '../../uploads', existing.imageFileName);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    imageFileName = req.file.filename;
  }

  await vacationRepo.update(id, { destination, description, startDate, endDate, price, imageFileName });
  const updated = await vacationRepo.findById(id, req.user?.id);
  res.json(updated);
}

export async function deleteVacation(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const existing = await vacationRepo.findById(id);
  if (!existing) throw new AppError('Vacation not found', 404);

  // Delete the image file if it's not a seed image
  const imgPath = path.join(__dirname, '../../uploads', existing.imageFileName);
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

  await vacationRepo.remove(id);
  res.status(204).send();
}

export async function likeVacation(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const vacationId = parseInt(req.params.id);

  const exists = await vacationRepo.findById(vacationId);
  if (!exists) throw new AppError('Vacation not found', 404);

  const alreadyLiked = await adminRepo.getLike(userId, vacationId);
  if (alreadyLiked) throw new AppError('You already liked this vacation', 409);

  await adminRepo.addLike(userId, vacationId);
  const updated = await vacationRepo.findById(vacationId, userId);
  res.json(updated);
}

export async function unlikeVacation(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const vacationId = parseInt(req.params.id);
  await adminRepo.removeLike(userId, vacationId);
  const updated = await vacationRepo.findById(vacationId, userId);
  res.json(updated);
}
