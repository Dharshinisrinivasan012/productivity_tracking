import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  CheckCircle2,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '@/api';
import { StatCard, Card, ProgressBar, Badge, Spinner } from '@/components/ui';
import { formatDate, formatTime } from '@/utils';
import { useSocket } from '@/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    refetchInterval: 60000,
  });

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: any) => {
      // Invalidate dashboard on relevant notifications
      const relevantTypes = [
        'task_created',
        'task_completed',
        'habit_completed',
        'habit_streak',
        'study_session',
        'deadline_alert',
      ];

      if (relevantTypes.includes(notification.type)) {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, queryClient]);

  const dashboard = data?.data?.data;

  if (isLoading) return <Spinner size="lg" />;
  if (!dashboard) return null;

  const chartData = dashboard.weeklyTrend.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    score: d.productivityScore,
    tasks: d.tasksCompleted,
    habits: d.habitsCompleted,
    study: d.studyMinutes,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Your productivity overview</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard
            title="Total Tasks"
            value={dashboard.overview.totalTasks}
            subtitle={`${dashboard.overview.completedTasks} completed`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="primary"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Pending"
            value={dashboard.overview.pendingTasks}
            subtitle={`${dashboard.overview.overdueTasks} overdue`}
            icon={<AlertCircle className="w-5 h-5" />}
            color="warning"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Habits"
            value={`${dashboard.overview.activeHabits}/${dashboard.overview.totalHabits}`}
            subtitle={`${dashboard.overview.currentStreak} day streak`}
            icon={<Target className="w-5 h-5" />}
            color="amber"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Study Hours"
            value={dashboard.overview.totalStudyHours}
            subtitle="Total time"
            icon={<BookOpen className="w-5 h-5" />}
            color="purple"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="Productivity"
            value={dashboard.overview.productivityScore}
            subtitle="Today's score"
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Summary */}
        <Card title="Today's Summary">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Tasks Due</p>
                  <p className="text-xs text-slate-500">Today</p>
                </div>
              </div>
              <span className="text-lg font-bold">{dashboard.todaySummary.tasksDueToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Habits Due</p>
                  <p className="text-xs text-slate-500">Today</p>
                </div>
              </div>
              <span className="text-lg font-bold">{dashboard.todaySummary.habitsDueToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Study Sessions</p>
                  <p className="text-xs text-slate-500">Today</p>
                </div>
              </div>
              <span className="text-lg font-bold">{dashboard.todaySummary.studySessionsToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Upcoming</p>
                  <p className="text-xs text-slate-500">Deadlines</p>
                </div>
              </div>
              <span className="text-lg font-bold">{dashboard.todaySummary.upcomingDeadlines}</span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium">Tasks Completed</p>
              </div>
              <span className="text-lg font-bold">{dashboard.recentActivity.tasksCompletedToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-amber-500" />
                <p className="text-sm font-medium">Habits Completed</p>
              </div>
              <span className="text-lg font-bold">{dashboard.recentActivity.habitsCompletedToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <p className="text-sm font-medium">Study Sessions</p>
              </div>
              <span className="text-lg font-bold">{dashboard.recentActivity.studySessionsToday}</span>
            </div>
          </div>
        </Card>

        {/* Progress Overview */}
        <Card title="Progress Overview">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tasks</span>
                <span>{dashboard.taskCompletion.rate}%</span>
              </div>
              <ProgressBar value={dashboard.taskCompletion.rate} color="bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Habits</span>
                <span>{dashboard.habitProgress.rate}%</span>
              </div>
              <ProgressBar value={dashboard.habitProgress.rate} color="bg-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Study</span>
                <span>{dashboard.studyProgress.avgProgress}%</span>
              </div>
              <ProgressBar value={dashboard.studyProgress.avgProgress} color="bg-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <Card title="Weekly Productivity">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Score" />
              <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Tasks" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Upcoming Deadlines */}
        <Card title="Upcoming Deadlines" action={<Calendar className="w-5 h-5 text-slate-400" />}>
          {dashboard.upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {dashboard.upcomingDeadlines.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(task.dueDate)}</p>
                  </div>
                  <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'info'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Exams */}
        <Card title="Upcoming Exams" action={<AlertCircle className="w-5 h-5 text-slate-400" />}>
          {dashboard.upcomingExams.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {dashboard.upcomingExams.map((exam) => (
                <div key={exam._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-medium">{exam.topic}</p>
                    <p className="text-xs text-slate-500">{formatDate(exam.examDate)}</p>
                  </div>
                  <ProgressBar value={exam.progress} size="sm" className="w-20" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
