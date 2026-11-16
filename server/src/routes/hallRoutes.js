import { Router } from 'express';
import {
  getAllLectureHalls,
  getLectureHallById,
  createLectureHall,
  updateLectureHall,
  deleteLectureHall,
  toggleHallStatus
} from '../controllers/hallController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAllLectureHalls);
router.get('/:id', getLectureHallById);
router.post('/', requireAdmin, createLectureHall);
router.put('/:id', requireAdmin, updateLectureHall);
router.delete('/:id', requireAdmin, deleteLectureHall);
router.patch('/:id/toggle-status', requireAdmin, toggleHallStatus);

export default router;