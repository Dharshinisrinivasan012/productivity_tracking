import { Router } from 'express';
import * as habitController from '../controllers/habit.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';
import { createHabitSchema, trackHabitSchema, idParamSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', habitController.getHabits);
router.get('/analytics', habitController.getHabitAnalytics);
router.get('/trends', habitController.getHabitTrends);
router.get('/:id', validate(idParamSchema), habitController.getHabit);
router.post('/', validate(createHabitSchema), habitController.createHabit);
router.put('/:id', validate(idParamSchema), habitController.updateHabit);
router.delete('/:id', validate(idParamSchema), habitController.deleteHabit);
router.post('/:id/track', validate(trackHabitSchema), habitController.trackHabit);
router.delete('/:id/track', validate(trackHabitSchema), habitController.untrackHabit);

export default router;
