import { useEffect } from 'react';
import { useThemeStore, applyTheme } from '@/store';

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return { theme, setTheme };
}
