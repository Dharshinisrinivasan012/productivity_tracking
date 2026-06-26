import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute, PublicRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from '@/pages/auth/AuthPages';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { HabitsPage } from '@/pages/HabitsPage';
import { StudyPage } from '@/pages/StudyPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AIPage } from '@/pages/AIPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route path="/" element={<ProtectedRoute><Layout><Navigate to="/dashboard" replace /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Layout><HabitsPage /></Layout></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><Layout><StudyPage /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><Layout><AIPage /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
