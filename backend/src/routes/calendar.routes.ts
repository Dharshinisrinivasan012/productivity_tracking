import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';
import { scheduleTaskSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/events', calendarController.getCalendarEvents);
router.post('/schedule', validate(scheduleTaskSchema), calendarController.scheduleTask);

export default router;
