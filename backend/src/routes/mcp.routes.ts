import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as mcpCtrl from '../controllers/mcp.controller.js';

const router = Router();

router.post('/ask', requireAuth, asyncHandler(mcpCtrl.ask));

export default router;
