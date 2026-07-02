import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as reviewCtrl from '../controllers/reviews.controller.js';

const router = Router();

// Nested under /vacations/:id/reviews
router.get('/:id/reviews',  requireAuth, asyncHandler(reviewCtrl.getReviews));
router.post('/:id/reviews', requireAuth, asyncHandler(reviewCtrl.createReview));

export default router;
