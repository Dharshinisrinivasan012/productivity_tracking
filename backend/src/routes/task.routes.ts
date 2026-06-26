import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';
import { createTaskSchema, updateTaskSchema, idParamSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.get('/kanban', taskController.getKanbanBoard);
router.get('/categories', taskController.getCategories);
router.get('/tags', taskController.getTags);
router.get('/reminders/check', taskController.checkReminders);
router.get('/:id', validate(idParamSchema), taskController.getTask);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', validate(idParamSchema), taskController.deleteTask);
router.patch('/kanban/order', taskController.updateKanbanOrder);

export default router;
