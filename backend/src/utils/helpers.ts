import { Response, Request, NextFunction, RequestHandler } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500
): void => {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  res.status(statusCode).json(response);
};

export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void | Response>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};

export const generateToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const calculateStreak = (dates: Date[]): { daily: number; weekly: number; monthly: number } => {
  if (dates.length === 0) return { daily: 0, weekly: 0, monthly: 0 };

  const sortedDates = [...dates]
    .map((d) => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  const uniqueDays = [...new Set(sortedDates)];
  let dailyStreak = 0;
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;

  if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
    dailyStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i - 1] - uniqueDays[i] === 86400000) {
        dailyStreak++;
      } else {
        break;
      }
    }
  }

  const weekStart = (date: number) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d.setHours(0, 0, 0, 0);
  };

  const weeks = uniqueDays.map(weekStart);
  const uniqueWeeks = [...new Set(weeks)].sort((a, b) => b - a);
  let weeklyStreak = 0;
  const currentWeek = weekStart(today);

  if (uniqueWeeks[0] === currentWeek || uniqueWeeks[0] === currentWeek - 7 * 86400000) {
    weeklyStreak = 1;
    for (let i = 1; i < uniqueWeeks.length; i++) {
      if (uniqueWeeks[i - 1] - uniqueWeeks[i] === 7 * 86400000) {
        weeklyStreak++;
      } else {
        break;
      }
    }
  }

  const monthKey = (date: number) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  };

  const months = uniqueDays.map(monthKey);
  const uniqueMonths = [...new Set(months)];
  let monthlyStreak = 0;
  const currentMonth = monthKey(today);
  const lastMonth = monthKey(new Date(today).setMonth(new Date(today).getMonth() - 1));

  if (uniqueMonths[0] === currentMonth || uniqueMonths[0] === lastMonth) {
    monthlyStreak = 1;
    for (let i = 1; i < uniqueMonths.length; i++) {
      const [y1, m1] = uniqueMonths[i - 1].split('-').map(Number);
      const [y2, m2] = uniqueMonths[i].split('-').map(Number);
      const diff = (y1 - y2) * 12 + (m1 - m2);
      if (diff === 1) {
        monthlyStreak++;
      } else {
        break;
      }
    }
  }

  return { daily: dailyStreak, weekly: weeklyStreak, monthly: monthlyStreak };
};

export const calculateProductivityScore = (
  tasksCompleted: number,
  habitsCompleted: number,
  studyMinutes: number
): number => {
  const taskScore = Math.min(tasksCompleted * 10, 40);
  const habitScore = Math.min(habitsCompleted * 15, 30);
  const studyScore = Math.min(studyMinutes / 6, 30);
  return Math.round(taskScore + habitScore + studyScore);
};
