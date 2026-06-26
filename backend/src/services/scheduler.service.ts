import { Task, StudyPlan, User } from '../models';
import { createAndEmitNotification } from './notification.service';

export const checkDeadlineAlerts = async (): Promise<void> => {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcomingTasks = await Task.find({
    dueDate: { $gte: now, $lte: in24Hours },
    status: { $ne: 'done' },
  }).populate('userId', 'email preferences');

  for (const task of upcomingTasks) {
    const user = task.userId as unknown as {
      _id: string;
      email: string;
      preferences: { notifications: { email: boolean } };
    };
    if (!user?._id) continue;

    await createAndEmitNotification(
      user._id.toString(),
      'deadline_alert',
      'Deadline Approaching',
      `"${task.title}" is due within 24 hours`,
      `/tasks`,
      { taskId: task._id },
      user.preferences?.notifications?.email,
      user.email
    );
  }

  const upcomingExams = await StudyPlan.find({
    examDate: { $gte: now, $lte: in24Hours },
    status: { $ne: 'completed' },
  }).populate('userId', 'email preferences');

  for (const plan of upcomingExams) {
    const user = plan.userId as unknown as {
      _id: string;
      email: string;
      preferences: { notifications: { email: boolean } };
    };
    if (!user?._id) continue;

    await createAndEmitNotification(
      user._id.toString(),
      'deadline_alert',
      'Exam Approaching',
      `Exam for "${plan.topic}" is within 24 hours`,
      `/study`,
      { studyPlanId: plan._id },
      user.preferences?.notifications?.email,
      user.email
    );
  }
};

export const startReminderScheduler = (): void => {
  checkDeadlineAlerts();
  setInterval(checkDeadlineAlerts, 60 * 60 * 1000);
};
