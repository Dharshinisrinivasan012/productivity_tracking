import { Router } from 'express';
import * as studyController from '../controllers/study.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';
import {
  createSubjectSchema,
  createStudyPlanSchema,
  createStudySessionSchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Subjects
router.get('/subjects', studyController.getSubjects);
router.post('/subjects', validate(createSubjectSchema), studyController.createSubject);
router.put('/subjects/:id', validate(idParamSchema), studyController.updateSubject);
router.delete('/subjects/:id', validate(idParamSchema), studyController.deleteSubject);

// Study Plans
router.get('/plans', studyController.getStudyPlans);
router.post('/plans', validate(createStudyPlanSchema), studyController.createStudyPlan);
router.put('/plans/:id', validate(idParamSchema), studyController.updateStudyPlan);
router.delete('/plans/:id', validate(idParamSchema), studyController.deleteStudyPlan);

// Study Sessions
router.get('/sessions', studyController.getStudySessions);
router.post('/sessions', validate(createStudySessionSchema), studyController.createStudySession);

// Other
router.get('/exams', studyController.getExamSchedule);
router.get('/progress', studyController.getStudyProgress);

export default router;
