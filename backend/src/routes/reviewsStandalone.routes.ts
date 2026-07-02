import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as reviewCtrl from '../controllers/reviews.controller.js';

const router = Router();

// Stand-alone review operations (not nested under vacations)
router.put('/:id',    requireAuth, asyncHandler(reviewCtrl.updateReview));
router.delete('/:id', requireAuth, asyncHandler(reviewCtrl.deleteReview));

export default router;
