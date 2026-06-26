import { Response } from 'express';
import { Task, StudyPlan, StudySession } from '../models';
import { AuthRequest } from '../types';
import { AppError, sendSuccess, asyncHandler } from '../utils/helpers';

export const getCalendarEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { start, end, view = 'month' } = req.query;
  const startDate = start ? new Date(start as string) : new Date();
  const endDate = end
    ? new Date(end as string)
    : new Date(startDate.getTime() + 30 * 86400000);

  if (view === 'day') {
    endDate.setTime(startDate.getTime() + 86400000);
  } else if (view === 'week') {
    endDate.setTime(startDate.getTime() + 7 * 86400000);
  }

  const [tasks, studyPlans, studySessions] = await Promise.all([
    Task.find({
      userId: req.userId,
      $or: [
        { dueDate: { $gte: startDate, $lte: endDate } },
        { scheduledStart: { $gte: startDate, $lte: endDate } },
        { reminder: { $gte: startDate, $lte: endDate } },
      ],
    }),
    StudyPlan.find({
      userId: req.userId,
      $or: [
        { deadline: { $gte: startDate, $lte: endDate } },
        { examDate: { $gte: startDate, $lte: endDate } },
      ],
    }).populate('subjectId', 'name color'),
    StudySession.find({
      userId: req.userId,
      startedAt: { $gte: startDate, $lte: endDate },
    }).populate('subjectId', 'name color'),
  ]);

  const events = [
    ...tasks.map((task) => ({
      id: task._id,
      type: 'task' as const,
      title: task.title,
      start: task.scheduledStart || task.dueDate || task.reminder,
      end: task.scheduledEnd,
      status: task.status,
      priority: task.priority,
      color: getPriorityColor(task.priority),
      draggable: true,
      data: task,
    })),
    ...studyPlans.map((plan) => ({
      id: plan._id,
      type: 'study' as const,
      title: plan.topic,
      start: plan.deadline || plan.examDate,
      end: plan.examDate,
      status: plan.status,
      color: '#8b5cf6',
      draggable: false,
      data: plan,
    })),
    ...studySessions.map((session) => ({
      id: session._id,
      type: 'session' as const,
      title: `Study Session (${session.duration}min)`,
      start: session.startedAt,
      end: session.endedAt || new Date(session.startedAt.getTime() + session.duration * 60000),
      color: '#10b981',
      draggable: false,
      data: session,
    })),
  ].filter((e) => e.start);

  sendSuccess(res, { events, view, startDate, endDate });
});

export const scheduleTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId, scheduledStart, scheduledEnd } = req.body;

  const task = await Task.findOne({ _id: taskId, userId: req.userId });
  if (!task) throw new AppError('Task not found', 404);

  task.scheduledStart = new Date(scheduledStart);
  task.scheduledEnd = new Date(scheduledEnd);
  await task.save();

  sendSuccess(res, task, 'Task scheduled');
});

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  };
  return colors[priority] || '#6366f1';
};
