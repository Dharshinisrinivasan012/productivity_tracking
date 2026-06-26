import api from './client';
import type { Subject, StudyPlan, StudySession, ApiResponse } from '@/types';

export const studyApi = {
  getSubjects: () => api.get<ApiResponse<Subject[]>>('/study/subjects'),
  createSubject: (data: Partial<Subject>) =>
    api.post<ApiResponse<Subject>>('/study/subjects', data),
  updateSubject: (id: string, data: Partial<Subject>) =>
    api.put<ApiResponse<Subject>>(`/study/subjects/${id}`, data),
  deleteSubject: (id: string) => api.delete(`/study/subjects/${id}`),

  getPlans: () => api.get<ApiResponse<StudyPlan[]>>('/study/plans'),
  createPlan: (data: Partial<StudyPlan> & { subjectId: string }) =>
    api.post<ApiResponse<StudyPlan>>('/study/plans', data),
  updatePlan: (id: string, data: Partial<StudyPlan>) =>
    api.put<ApiResponse<StudyPlan>>(`/study/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/study/plans/${id}`),

  getSessions: (days?: number) =>
    api.get<ApiResponse<StudySession[]>>('/study/sessions', { params: { days } }),
  createSession: (data: Partial<StudySession>) =>
    api.post<ApiResponse<StudySession>>('/study/sessions', data),

  getExams: () => api.get<ApiResponse<StudyPlan[]>>('/study/exams'),
  getProgress: () => api.get('/study/progress'),
};
