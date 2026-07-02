import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/auth.js';
import * as adminCtrl from '../controllers/admin.controller.js';

const router = Router();

// Bookings management
router.get('/bookings',     requireAdmin, asyncHandler(adminCtrl.adminGetBookings));
router.put('/bookings/:id', requireAdmin, asyncHandler(adminCtrl.adminUpdateBooking));

// Analytics
router.get('/analytics/overview',          requireAdmin, asyncHandler(adminCtrl.analyticsOverview));
router.get('/analytics/revenue-by-month',  requireAdmin, asyncHandler(adminCtrl.analyticsRevenueByMonth));
router.get('/analytics/popular-vacations', requireAdmin, asyncHandler(adminCtrl.analyticsPopularVacations));

export default router;
