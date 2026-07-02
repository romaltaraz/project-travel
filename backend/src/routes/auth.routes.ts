import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as authCtrl from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', asyncHandler(authCtrl.register));
router.post('/login',    asyncHandler(authCtrl.login));

export default router;
