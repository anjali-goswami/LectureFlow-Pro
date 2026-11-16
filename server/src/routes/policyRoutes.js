import { Router } from 'express';
import { getPolicies, updatePolicies } from '../controllers/policyController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getPolicies);
router.put('/', requireAdmin, updatePolicies);

export default router;