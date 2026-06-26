import api from './client';
import type { DashboardData, CalendarEvent, Notification, ApiResponse } from '@/types';

export const dashboardApi = {
  get: () => api.get<ApiResponse<DashboardData>>('/dashboard'),
};

export const analyticsApi = {
  getProductivity: (days?: number) =>
    api.get('/analytics/productivity', { params: { days } }),
  getTasks: (days?: number) => api.get('/analytics/tasks', { params: { days } }),
  getHabits: (days?: number) => api.get('/analytics/habits', { params: { days } }),
  getStudy: (days?: number) => api.get('/analytics/study', { params: { days } }),
  getCompletionRates: (days?: number) =>
    api.get('/analytics/completion-rates', { params: { days } }),
};

export const calendarApi = {
  getEvents: (start?: string, end?: string, view?: string) =>
    api.get<ApiResponse<{ events: CalendarEvent[] }>>('/calendar/events', {
      params: { start, end, view },
    }),
  scheduleTask: (taskId: string, scheduledStart: string, scheduledEnd: string) =>
    api.post('/calendar/schedule', { taskId, scheduledStart, scheduledEnd }),
};

export const notificationsApi = {
  getAll: (page?: number, unreadOnly?: boolean) =>
    api.get('/notifications', { params: { page, unreadOnly } }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const aiApi = {
  prioritizeTasks: () => api.post('/ai/prioritize'),
  studyRecommendations: () => api.post('/ai/study-recommendations'),
  weeklyGoals: () => api.post('/ai/weekly-goals'),
};
