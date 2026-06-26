import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/prioritize', aiController.aiPrioritizeTasks);
router.post('/study-recommendations', aiController.aiStudyRecommendations);
router.post('/weekly-goals', aiController.aiWeeklyGoals);

export default router;
