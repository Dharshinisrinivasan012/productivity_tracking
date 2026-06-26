import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';
import { idParamSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', validate(idParamSchema), notificationController.markAsRead);
router.delete('/:id', validate(idParamSchema), notificationController.deleteNotification);

export default router;
