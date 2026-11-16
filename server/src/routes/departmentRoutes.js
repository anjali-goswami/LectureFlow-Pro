import { Router } from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireAdmin, createDepartment);
router.put('/:id', requireAdmin, updateDepartment);
router.delete('/:id', requireAdmin, deleteDepartment);

export default router;