import { Response } from 'express';
import { Task, Habit, StudySession, Analytics } from '../models';
import { AuthRequest } from '../types';
import { sendSuccess, asyncHandler } from '../utils/helpers';
import { getAnalyticsRange } from '../services/analytics.service';

export const getProductivityTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string, 10);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const analytics = await getAnalyticsRange(req.userId!, startDate, endDate);
  sendSuccess(res, analytics);
});

export const getTaskAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { days = '30' } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days as string, 10));

  const [byStatus, byPriority, completionTrend] = await Promise.all([
    Task.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Analytics.find({ userId, date: { $gte: startDate } })
      .select('date tasksCompleted tasksCreated')
      .sort({ date: 1 }),
  ]);

  const total = await Task.countDocuments({ userId });
  const completed = await Task.countDocuments({ userId, status: 'done' });

  sendSuccess(res, {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
    byPriority: byPriority.map((p) => ({ priority: p._id, count: p.count })),
    completionTrend,
  });
});

export const getHabitAnalyticsOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habits = await Habit.find({ userId: req.userId });
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const trends: { date: string; rate: number }[] = [];
  for (let i = daysNum - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    let completed = 0;
    for (const habit of habits) {
      const dayCompletion = habit.completions.find(
        (c) =>
          new Date(c.date).setHours(0, 0, 0, 0) === date.getTime() &&
          c.count >= habit.targetCount
      );
      if (dayCompletion) completed++;
    }

    trends.push({
      date: date.toISOString().split('T')[0],
      rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
    });
  }

  sendSuccess(res, { totalHabits: habits.length, trends });
});

export const getStudyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { days = '30' } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days as string, 10));

  const sessions = await StudySession.find({
    userId: req.userId,
    startedAt: { $gte: startDate },
    type: { $in: ['study', 'pomodoro'] },
  });

  const byDay: Record<string, number> = {};
  for (const session of sessions) {
    const day = new Date(session.startedAt).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + session.duration;
  }

  const trends = Object.entries(byDay)
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const pomodoroSessions = sessions.filter((s) => s.type === 'pomodoro').length;

  sendSuccess(res, {
    totalMinutes,
    totalSessions: sessions.length,
    pomodoroSessions,
    avgSessionLength:
      sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
    trends,
  });
});

export const getCompletionRates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { days = '30' } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days as string, 10));

  const analytics = await Analytics.find({
    userId,
    date: { $gte: startDate },
  }).sort({ date: 1 });

  sendSuccess(res, analytics.map((a) => ({
    date: a.date,
    tasksCompleted: a.tasksCompleted,
    tasksCreated: a.tasksCreated,
    habitsCompleted: a.habitsCompleted,
    studyMinutes: a.studyMinutes,
    productivityScore: a.productivityScore,
  })));
});
