import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepo from '../repositories/auth.repository.js';
import { AppError } from '../middleware/errorHandler.js';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(4, 'Password must be at least 4 characters'),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { firstName, lastName, email, password } = parsed.data;

  const existing = await authRepo.findUserByEmail(email);
  if (existing) throw new AppError('Email is already registered', 409);

  const hash = await bcrypt.hash(password, 10);
  const user = await authRepo.createUser(firstName, lastName, email, hash);

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: { id: user.id, firstName, lastName, email, role: user.role },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password } = parsed.data;

  const user = await authRepo.findUserByEmail(email);
  if (!user) throw new AppError('Invalid email or password', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid email or password', 401);

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
  });
}
