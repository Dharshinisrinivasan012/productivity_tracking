import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import habitRoutes from './habit.routes';
import studyRoutes from './study.routes';
import dashboardRoutes from './dashboard.routes';
import analyticsRoutes from './analytics.routes';
import calendarRoutes from './calendar.routes';
import notificationRoutes from './notification.routes';
import aiRoutes from './ai.routes';
import testRoutes from './test.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'PPMS API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/study', studyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/calendar', calendarRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/test', testRoutes);

export default router;
