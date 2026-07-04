import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as hotelCtrl from '../controllers/hotel.controller.js';

const router = Router();

router.get('/',           requireAuth, asyncHandler(hotelCtrl.getHotels));
router.post('/:id/like',   requireAuth, asyncHandler(hotelCtrl.likeHotel));
router.delete('/:id/like', requireAuth, asyncHandler(hotelCtrl.unlikeHotel));

export default router;
