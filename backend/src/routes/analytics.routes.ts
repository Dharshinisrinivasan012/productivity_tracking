import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/productivity', analyticsController.getProductivityTrends);
router.get('/tasks', analyticsController.getTaskAnalytics);
router.get('/habits', analyticsController.getHabitAnalyticsOverview);
router.get('/study', analyticsController.getStudyAnalytics);
router.get('/completion-rates', analyticsController.getCompletionRates);

export default router;
