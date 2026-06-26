import api from './client';
import type { Task, KanbanBoard, ApiResponse, PaginatedResponse } from '@/types';

export interface TaskFilters {
  status?: string;
  priority?: string;
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export const tasksApi = {
  getAll: (filters?: TaskFilters) =>
    api.get<PaginatedResponse<Task>>('/tasks', { params: filters }),

  getById: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),

  create: (data: Partial<Task>) => api.post<ApiResponse<Task>>('/tasks', data),

  update: (id: string, data: Partial<Task>) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/tasks/${id}`),

  getKanban: () => api.get<ApiResponse<KanbanBoard>>('/tasks/kanban'),

  updateKanbanOrder: (taskId: string, status: string, order: number) =>
    api.patch('/tasks/kanban/order', { taskId, status, order }),

  getCategories: () => api.get<ApiResponse<string[]>>('/tasks/categories'),

  getTags: () => api.get<ApiResponse<string[]>>('/tasks/tags'),
};
