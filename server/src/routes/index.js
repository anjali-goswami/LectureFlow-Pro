import { Router } from 'express';
import authRoutes from './authRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import courseRoutes from './courseRoutes.js';
import hallRoutes from './hallRoutes.js';
import timeSlotRoutes from './timeSlotRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';
import conflictRoutes from './conflictRoutes.js';
import policyRoutes from './policyRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use('/auth', authRoutes);

// Every data route requires a valid session; individual mutating routes
// additionally require the admin role.
router.use('/departments', authenticate, departmentRoutes);
router.use('/courses', authenticate, courseRoutes);
router.use('/lecture-halls', authenticate, hallRoutes);
router.use('/time-slots', authenticate, timeSlotRoutes);
router.use('/schedules', authenticate, scheduleRoutes);
router.use('/conflicts', authenticate, conflictRoutes);
router.use('/policies', authenticate, policyRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);

export default router;