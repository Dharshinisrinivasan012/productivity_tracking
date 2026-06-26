import { Analytics, Task, Habit, StudySession } from '../models';
import { calculateProductivityScore } from '../utils/helpers';

export const updateDailyAnalytics = async (userId: string, date?: Date): Promise<void> => {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [tasksCompleted, tasksCreated, habits, studySessions] = await Promise.all([
    Task.countDocuments({
      userId,
      status: 'done',
      completedAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    Task.countDocuments({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    Habit.find({ userId }),
    StudySession.find({
      userId,
      startedAt: { $gte: startOfDay, $lte: endOfDay },
      type: { $in: ['study', 'pomodoro'] },
    }),
  ]);

  let habitsCompleted = 0;
  for (const habit of habits) {
    const todayCompletion = habit.completions.find(
      (c) => new Date(c.date).setHours(0, 0, 0, 0) === startOfDay.getTime()
    );
    if (todayCompletion && todayCompletion.count >= habit.targetCount) {
      habitsCompleted++;
    }
  }

  const studyMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0);
  const productivityScore = calculateProductivityScore(
    tasksCompleted,
    habitsCompleted,
    studyMinutes
  );

  await Analytics.findOneAndUpdate(
    { userId, date: startOfDay },
    {
      tasksCompleted,
      tasksCreated,
      habitsCompleted,
      studyMinutes,
      productivityScore,
    },
    { upsert: true, new: true }
  );
};

export const getAnalyticsRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return Analytics.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });
};
