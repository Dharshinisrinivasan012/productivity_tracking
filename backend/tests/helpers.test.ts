import { calculateStreak, calculateProductivityScore } from '../src/utils/helpers';

describe('Helper Functions', () => {
  describe('calculateProductivityScore', () => {
    it('should calculate score correctly', () => {
      const score = calculateProductivityScore(3, 2, 60);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should cap at 100', () => {
      const score = calculateProductivityScore(10, 10, 500);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateStreak', () => {
    it('should return zero streaks for empty dates', () => {
      const streaks = calculateStreak([]);
      expect(streaks.daily).toBe(0);
      expect(streaks.weekly).toBe(0);
      expect(streaks.monthly).toBe(0);
    });

    it('should calculate daily streak', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const streaks = calculateStreak([today, yesterday]);
      expect(streaks.daily).toBeGreaterThanOrEqual(1);
    });
  });
});
