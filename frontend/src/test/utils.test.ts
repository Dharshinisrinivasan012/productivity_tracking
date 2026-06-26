import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatTime, getInitials } from '@/utils';

describe('Utils', () => {
  it('cn should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('formatTime should format minutes', () => {
    expect(formatTime(30)).toBe('30m');
    expect(formatTime(90)).toBe('1h 30m');
    expect(formatTime(120)).toBe('2h 0m');
  });

  it('getInitials should return initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Alice')).toBe('A');
  });

  it('formatDate should return empty for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });
});
