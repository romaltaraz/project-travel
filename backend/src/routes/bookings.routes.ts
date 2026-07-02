import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as bookingCtrl from '../controllers/bookings.controller.js';

const router = Router();

router.get('/me',     requireAuth, asyncHandler(bookingCtrl.getMyBookings));
router.delete('/:id', requireAuth, asyncHandler(bookingCtrl.cancelBooking));

export default router;
