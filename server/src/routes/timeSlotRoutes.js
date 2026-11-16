import { Router } from 'express';
import {
  getAllTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} from '../controllers/timeSlotController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAllTimeSlots);
router.get('/:id', getTimeSlotById);
router.post('/', requireAdmin, createTimeSlot);
router.put('/:id', requireAdmin, updateTimeSlot);
router.delete('/:id', requireAdmin, deleteTimeSlot);

export default router;