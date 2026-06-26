import { useEffect, useCallback } from 'react';
import { usePomodoroStore } from '@/store';
import { studyApi } from '@/api/study';

export function usePomodoro() {
  const store = usePomodoroStore();

  useEffect(() => {
    if (!store.isRunning) return;

    const interval = setInterval(() => {
      store.tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [store.isRunning, store.tick]);

  const saveSession = useCallback(async () => {
    const workMinutes = usePomodoroStore.getState().timeLeft;
    const { subjectId, studyPlanId, isBreak } = usePomodoroStore.getState();

    if (!isBreak) {
      await studyApi.createSession({
        subjectId,
        studyPlanId,
        type: 'pomodoro',
        duration: workMinutes,
        startedAt: new Date(Date.now() - workMinutes * 60000).toISOString(),
        endedAt: new Date().toISOString(),
      });
    }
  }, []);

  return { ...store, saveSession };
}
