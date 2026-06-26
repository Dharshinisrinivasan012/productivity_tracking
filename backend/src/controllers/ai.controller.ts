import { Response } from 'express';
import { Task, StudyPlan, Analytics } from '../models';
import { AuthRequest } from '../types';
import { sendSuccess, asyncHandler } from '../utils/helpers';
import {
  prioritizeTasks,
  getStudyRecommendations,
  generateWeeklyGoals,
} from '../services/ai.service';

export const aiPrioritizeTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find({
    userId: req.userId,
    status: { $ne: 'done' },
  }).sort({ dueDate: 1 });

  const priorities = await prioritizeTasks(tasks);
  sendSuccess(res, priorities);
});

export const aiStudyRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const plans = await StudyPlan.find({ userId: req.userId }).populate('subjectId', 'name');

  const subjects = plans.map((plan) => {
    const subject = plan.subjectId as unknown as { name?: string };
    return {
      name: subject?.name || 'Unknown',
      progress: plan.progress,
      deadline: plan.deadline?.toISOString(),
    };
  });

  const uniqueSubjects = [...new Map(subjects.map((s) => [s.name, s])).values()];
  const recommendations = await getStudyRecommendations(uniqueSubjects);
  sendSuccess(res, recommendations);
});

export const aiWeeklyGoals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const analytics = await Analytics.find({
    userId: req.userId,
    date: { $gte: weekAgo },
  });

  const stats = {
    tasksCompleted: analytics.reduce((sum, a) => sum + a.tasksCompleted, 0),
    habitsCompleted: analytics.reduce((sum, a) => sum + a.habitsCompleted, 0),
    studyMinutes: analytics.reduce((sum, a) => sum + a.studyMinutes, 0),
  };

  const goals = await generateWeeklyGoals(stats);
  sendSuccess(res, goals);
});
