import { Router } from 'express';
import * as testController from '../controllers/test.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/email', testController.testEmail);

export default router;
