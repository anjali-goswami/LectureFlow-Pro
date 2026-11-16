import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', requireAdmin, createCourse);
router.put('/:id', requireAdmin, updateCourse);
router.delete('/:id', requireAdmin, deleteCourse);

export default router;