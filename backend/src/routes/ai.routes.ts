import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as aiCtrl from '../controllers/ai.controller.js';

const router = Router();

router.post('/recommend',       requireAuth,  asyncHandler(aiCtrl.recommend));
router.post('/trip-plan',       requireAuth,  asyncHandler(aiCtrl.tripPlan));
router.post('/semantic-search', requireAuth,  asyncHandler(aiCtrl.semanticSearch));
router.post('/vacation-photo',  requireAdmin, asyncHandler(aiCtrl.generateVacationPhoto));

export default router;
