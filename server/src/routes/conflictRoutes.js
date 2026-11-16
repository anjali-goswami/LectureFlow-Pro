import { Router } from 'express';
import {
  getConflicts,
  applyResolution,
  autoResolve,
  exportConflictsCSV
} from '../controllers/conflictController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getConflicts);
router.post('/resolve', requireAdmin, applyResolution);
router.post('/auto-resolve', requireAdmin, autoResolve);
router.get('/export-csv', exportConflictsCSV);

export default router;