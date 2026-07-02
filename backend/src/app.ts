import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes    from './routes/auth.routes.js';
import vacationRoutes from './routes/vacation.routes.js';
import reviewRoutes  from './routes/reviewsStandalone.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import aiRoutes      from './routes/ai.routes.js';
import mcpRoutes     from './routes/mcp.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded vacation images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth',      authRoutes);
app.use('/api/vacations', vacationRoutes); // includes nested /reviews and /book
app.use('/api/reviews',   reviewRoutes);   // PUT /api/reviews/:id, DELETE /api/reviews/:id
app.use('/api/bookings',  bookingRoutes);  // GET /api/bookings/me, DELETE /api/bookings/:id
app.use('/api/admin',     adminRoutes);
app.use('/api/reports',   reportsRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/mcp',       mcpRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
