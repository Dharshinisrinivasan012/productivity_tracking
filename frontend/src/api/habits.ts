import api from './client';
import type { Habit, ApiResponse } from '@/types';

export const habitsApi = {
  getAll: () => api.get<ApiResponse<Habit[]>>('/habits'),

  getById: (id: string) => api.get<ApiResponse<Habit>>(`/habits/${id}`),

  create: (data: Partial<Habit>) => api.post<ApiResponse<Habit>>('/habits', data),

  update: (id: string, data: Partial<Habit>) =>
    api.put<ApiResponse<Habit>>(`/habits/${id}`, data),

  delete: (id: string) => api.delete(`/habits/${id}`),

  track: (id: string, date?: string, count?: number) =>
    api.post<ApiResponse<Habit>>(`/habits/${id}/track`, { date, count }),

  untrack: (id: string, date?: string) =>
    api.delete(`/habits/${id}/track`, { data: { date } }),

  getAnalytics: (days?: number) =>
    api.get('/habits/analytics', { params: { days } }),

  getTrends: (days?: number) =>
    api.get('/habits/trends', { params: { days } }),
};
