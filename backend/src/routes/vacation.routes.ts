import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import * as vacCtrl    from '../controllers/vacation.controller.js';
import * as reviewCtrl from '../controllers/reviews.controller.js';
import * as bookingCtrl from '../controllers/bookings.controller.js';

const router = Router();

// Vacation CRUD
router.get('/',     requireAuth,  asyncHandler(vacCtrl.getVacations));
router.get('/:id',  requireAuth,  asyncHandler(vacCtrl.getVacationById));
router.post('/',    requireAdmin, uploadSingle, asyncHandler(vacCtrl.createVacation));
router.put('/:id',  requireAdmin, uploadSingle, asyncHandler(vacCtrl.updateVacation));
router.delete('/:id', requireAdmin, asyncHandler(vacCtrl.deleteVacation));

// Likes (users only)
router.post('/:id/like',   requireAuth, asyncHandler(vacCtrl.likeVacation));
router.delete('/:id/like', requireAuth, asyncHandler(vacCtrl.unlikeVacation));

// Reviews (nested)
router.get('/:id/reviews',  requireAuth, asyncHandler(reviewCtrl.getReviews));
router.post('/:id/reviews', requireAuth, asyncHandler(reviewCtrl.createReview));

// Booking (nested)
router.post('/:id/book', requireAuth, asyncHandler(bookingCtrl.createBooking));

export default router;
