import { Router } from 'express';
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  clearAllSchedules,
  generateSchedule
} from '../controllers/scheduleController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAllSchedules);
router.post('/', requireAdmin, createSchedule);
router.post('/generate', requireAdmin, generateSchedule);
router.delete('/clear', requireAdmin, clearAllSchedules);
router.put('/:id', requireAdmin, updateSchedule);
router.delete('/:id', requireAdmin, deleteSchedule);

export default router;