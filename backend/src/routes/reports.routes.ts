import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/auth.js';
import * as reportsCtrl from '../controllers/reports.controller.js';

const router = Router();

router.get('/likes',      requireAdmin, asyncHandler(reportsCtrl.likesReport));
router.get('/likes/csv',  requireAdmin, asyncHandler(reportsCtrl.likesReportCsv));
router.get('/export/pdf', requireAdmin, asyncHandler(reportsCtrl.exportPdf));

export default router;
