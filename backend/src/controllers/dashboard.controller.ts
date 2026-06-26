import { Response } from 'express';
import { Task, Habit, StudyPlan, StudySession, Analytics } from '../models';
import { AuthRequest } from '../types';
import { sendSuccess, asyncHandler, calculateProductivityScore } from '../utils/helpers';

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    todayTasks,
    habits,
    studyPlans,
    todaySessions,
    allSessions,
    weekAnalytics,
    upcomingDeadlines,
    upcomingExams,
  ] = await Promise.all([
    Task.countDocuments({ userId }),
    Task.countDocuments({ userId, status: 'done' }),
    Task.countDocuments({ userId, status: { $ne: 'done' } }),
    Task.countDocuments({
      userId,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    }),
    Task.find({
      userId,
      $or: [
        { dueDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) } },
        { createdAt: { $gte: today } },
      ],
    }),
    Habit.find({ userId }),
    StudyPlan.find({ userId }),
    StudySession.find({
      userId,
      startedAt: { $gte: today },
      type: { $in: ['study', 'pomodoro'] },
    }),
    StudySession.find({ userId, type: { $in: ['study', 'pomodoro'] } }),
    Analytics.find({ userId, date: { $gte: weekAgo } }).sort({ date: 1 }),
    Task.find({
      userId,
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 86400000) },
      status: { $ne: 'done' },
    })
      .sort({ dueDate: 1 })
      .limit(5),
    StudyPlan.find({
      userId,
      examDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 86400000) },
    })
      .populate('subjectId', 'name color')
      .sort({ examDate: 1 })
      .limit(5),
  ]);

  // Calculate habit streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let habitsCompletedToday = 0;
  let activeHabits = 0;

  for (const habit of habits) {
    const todayCompletion = habit.completions.find(
      (c) =>
        new Date(c.date).setHours(0, 0, 0, 0) === today.getTime() &&
        c.count >= habit.targetCount
    );
    if (todayCompletion) habitsCompletedToday++;
    
    // Check if habit was completed in last 7 days to determine if active
    const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
    const recentCompletion = habit.completions.find(
      (c) => new Date(c.date) >= sevenDaysAgo && c.count >= habit.targetCount
    );
    if (recentCompletion) activeHabits++;

    // Calculate streak
    let streak = 0;
    let checkDate = new Date(today);
    while (true) {
      const completion = habit.completions.find(
        (c) => new Date(c.date).setHours(0, 0, 0, 0) === checkDate.getTime() &&
        c.count >= habit.targetCount
      );
      if (completion) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    if (streak > currentStreak) currentStreak = streak;
    if (streak > longestStreak) longestStreak = streak;
  }

  const studyMinutesToday = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalStudyMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
  const tasksCompletedToday = todayTasks.filter((t) => t.status === 'done').length;
  const tasksDueToday = todayTasks.filter((t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < new Date(today.getTime() + 86400000)).length;

  const productivityScore = calculateProductivityScore(
    tasksCompletedToday,
    habitsCompletedToday,
    studyMinutesToday
  );

  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const habitProgress =
    habits.length > 0
      ? Math.round((habitsCompletedToday / habits.length) * 100)
      : 0;

  const studyProgress =
    studyPlans.length > 0
      ? Math.round(
          studyPlans.reduce((sum, p) => sum + p.progress, 0) / studyPlans.length
        )
      : 0;

  sendSuccess(res, {
    overview: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalHabits: habits.length,
      activeHabits,
      currentStreak,
      longestStreak,
      totalStudyHours: Math.round(totalStudyMinutes / 60),
      productivityScore,
    },
    todaySummary: {
      tasksDueToday,
      habitsDueToday: habitsCompletedToday,
      studySessionsToday: todaySessions.length,
      upcomingDeadlines: upcomingDeadlines.length,
    },
    recentActivity: {
      tasksCompletedToday,
      habitsCompletedToday,
      studySessionsToday: todaySessions.length,
    },
    taskCompletion: {
      total: totalTasks,
      completed: completedTasks,
      rate: taskCompletionRate,
      todayCompleted: tasksCompletedToday,
      todayTotal: todayTasks.length,
    },
    habitProgress: {
      total: habits.length,
      completedToday: habitsCompletedToday,
      rate: habitProgress,
    },
    studyProgress: {
      totalPlans: studyPlans.length,
      avgProgress: studyProgress,
      minutesToday: studyMinutesToday,
    },
    upcomingDeadlines,
    upcomingExams,
    weeklyTrend: weekAnalytics.map((a) => ({
      date: a.date,
      productivityScore: a.productivityScore,
      tasksCompleted: a.tasksCompleted,
      habitsCompleted: a.habitsCompleted,
      studyMinutes: a.studyMinutes,
    })),
  });
});
