export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  createdAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    realtime: boolean;
  };
  pomodoro: {
    workMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
  };
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  category?: string;
  dueDate?: string;
  reminder?: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  kanbanOrder: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  completions: { date: string; count: number }[];
  createdAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  color: string;
  description?: string;
}

export interface StudyPlan {
  _id: string;
  subjectId: Subject | string;
  topic: string;
  description?: string;
  deadline?: string;
  examDate?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface StudySession {
  _id: string;
  subjectId?: string | Subject;
  studyPlanId?: string;
  type: 'study' | 'pomodoro' | 'break';
  duration: number;
  notes?: string;
  startedAt: string;
  endedAt?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    totalHabits: number;
    activeHabits: number;
    currentStreak: number;
    longestStreak: number;
    totalStudyHours: number;
    productivityScore: number;
  };
  todaySummary: {
    tasksDueToday: number;
    habitsDueToday: number;
    studySessionsToday: number;
    upcomingDeadlines: number;
  };
  recentActivity: {
    tasksCompletedToday: number;
    habitsCompletedToday: number;
    studySessionsToday: number;
  };
  taskCompletion: {
    total: number;
    completed: number;
    rate: number;
    todayCompleted: number;
    todayTotal: number;
  };
  habitProgress: {
    total: number;
    completedToday: number;
    rate: number;
  };
  studyProgress: {
    totalPlans: number;
    avgProgress: number;
    minutesToday: number;
  };
  upcomingDeadlines: Task[];
  upcomingExams: StudyPlan[];
  weeklyTrend: {
    date: string;
    productivityScore: number;
    tasksCompleted: number;
    habitsCompleted: number;
    studyMinutes: number;
  }[];
}

export interface CalendarEvent {
  id: string;
  type: 'task' | 'study' | 'session';
  title: string;
  start: string;
  end?: string;
  status?: string;
  priority?: string;
  color: string;
  draggable: boolean;
  data: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface KanbanBoard {
  todo: Task[];
  in_progress: Task[];
  review: Task[];
  done: Task[];
}
