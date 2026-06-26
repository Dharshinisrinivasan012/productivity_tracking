import { Response } from 'express';
import { Habit } from '../models';
import { AuthRequest } from '../types';
import { AppError, sendSuccess, asyncHandler, calculateStreak } from '../utils/helpers';
import { updateDailyAnalytics } from '../services/analytics.service';
import { createAndEmitNotification } from '../services/notification.service';

export const getHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: -1 });
  sendSuccess(res, habits);
});

export const getHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
  if (!habit) throw new AppError('Habit not found', 404);
  sendSuccess(res, habit);
});

export const createHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await Habit.create({ ...req.body, userId: req.userId });
  sendSuccess(res, habit, 'Habit created', 201);
});

export const updateHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!habit) throw new AppError('Habit not found', 404);
  sendSuccess(res, habit);
});

export const deleteHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!habit) throw new AppError('Habit not found', 404);
  sendSuccess(res, undefined, 'Habit deleted');
});

export const trackHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
  if (!habit) throw new AppError('Habit not found', 404);

  const trackDate = req.body.date ? new Date(req.body.date) : new Date();
  trackDate.setHours(0, 0, 0, 0);
  const count = req.body.count || 1;

  const existingIndex = habit.completions.findIndex(
    (c) => new Date(c.date).setHours(0, 0, 0, 0) === trackDate.getTime()
  );

  const previousCount = existingIndex >= 0 ? habit.completions[existingIndex].count : 0;

  if (existingIndex >= 0) {
    habit.completions[existingIndex].count += count;
  } else {
    habit.completions.push({ date: trackDate, count });
  }

  await habit.save();
  await updateDailyAnalytics(req.userId!);

  // Check if habit target was just reached
  const currentCount = habit.completions.find(
    (c) => new Date(c.date).setHours(0, 0, 0, 0) === trackDate.getTime()
  )?.count || 0;

  if (previousCount < habit.targetCount && currentCount >= habit.targetCount) {
    // Calculate current streak
    const completionDates = habit.completions
      .filter((c) => c.count >= habit.targetCount)
      .map((c) => c.date);
    const streaks = calculateStreak(completionDates);
    const currentStreak = streaks.daily || 0;

    // Send habit completion notification
    await createAndEmitNotification(
      req.userId!,
      'habit_completed',
      'Habit Completed',
      `You completed "${habit.name}" today!`,
      `/habits`,
      { habitId: habit._id },
      req.user?.preferences?.notifications?.email,
      req.user?.email
    );

    // Send streak achievement notification for milestones
    if (currentStreak > 0 && (currentStreak % 7 === 0 || currentStreak === 15 || currentStreak === 30)) {
      await createAndEmitNotification(
        req.userId!,
        'habit_streak',
        'Streak Achievement!',
        `You have a ${currentStreak}-day streak for "${habit.name}"!`,
        `/habits`,
        { habitId: habit._id, streak: currentStreak },
        req.user?.preferences?.notifications?.email,
        req.user?.email
      );
    }
  }

  sendSuccess(res, habit, 'Habit tracked');
});

export const untrackHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
  if (!habit) throw new AppError('Habit not found', 404);

  const trackDate = req.body.date ? new Date(req.body.date) : new Date();
  trackDate.setHours(0, 0, 0, 0);

  habit.completions = habit.completions.filter(
    (c) => new Date(c.date).setHours(0, 0, 0, 0) !== trackDate.getTime()
  );

  await habit.save();
  await updateDailyAnalytics(req.userId!);
  sendSuccess(res, habit);
});

export const getHabitAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habits = await Habit.find({ userId: req.userId });
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const analytics = habits.map((habit) => {
    const completionDates = habit.completions
      .filter((c) => new Date(c.date) >= startDate && c.count >= habit.targetCount)
      .map((c) => c.date);

    const streaks = calculateStreak(completionDates);
    const totalCompletions = habit.completions.reduce((sum, c) => sum + c.count, 0);
    const completionRate =
      daysNum > 0
        ? Math.round((completionDates.length / daysNum) * 100)
        : 0;

    return {
      habitId: habit._id,
      name: habit.name,
      color: habit.color,
      streaks,
      totalCompletions,
      completionRate,
      recentCompletions: habit.completions
        .filter((c) => new Date(c.date) >= startDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  });

  sendSuccess(res, analytics);
});

export const getHabitTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habits = await Habit.find({ userId: req.userId });
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string, 10);

  const trends: { date: string; completions: number }[] = [];
  for (let i = daysNum - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    let completions = 0;
    for (const habit of habits) {
      const dayCompletion = habit.completions.find(
        (c) =>
          new Date(c.date).setHours(0, 0, 0, 0) === date.getTime() &&
          c.count >= habit.targetCount
      );
      if (dayCompletion) completions++;
    }

    trends.push({
      date: date.toISOString().split('T')[0],
      completions,
    });
  }

  sendSuccess(res, trends);
});
