import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as aiCtrl from '../controllers/ai.controller.js';

const router = Router();

router.post('/recommend',       requireAuth, asyncHandler(aiCtrl.recommend));
router.post('/trip-plan',       requireAuth, asyncHandler(aiCtrl.tripPlan));
router.post('/semantic-search', requireAuth, asyncHandler(aiCtrl.semanticSearch));

export default router;
