import { describe, expect, it } from 'vitest';
import {
  cn,
  formatDate,
  riskClass,
  timeAgo,
  truncate,
  verdictClass,
} from '../../src/utils';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', false, undefined, null, 'c')).toBe('a b c');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-01-15T10:00:00.000Z')).not.toBe('—');
  });

  it('returns a dash for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for current dates', () => {
    expect(timeAgo(new Date())).toBe('just now');
  });

  it('returns days for older dates', () => {
    const old = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(old)).toBe('3d ago');
  });
});

describe('truncate', () => {
  it('truncates long strings with an ellipsis', () => {
    expect(truncate('x'.repeat(50), 10)).toHaveLength(10);
    expect(truncate('short', 10)).toBe('short');
  });
});

describe('verdictClass', () => {
  it('maps every verdict to a styling class', () => {
    expect(verdictClass('BUILD')).toContain('emerald');
    expect(verdictClass('KILL')).toContain('blood');
    expect(verdictClass('PIVOT')).toContain('sky');
    expect(verdictClass('VALIDATE')).toContain('amber');
    expect(verdictClass(null)).toContain('parchment-dim');
  });
});

describe('riskClass', () => {
  it('maps risk levels to styling classes', () => {
    expect(riskClass('CRITICAL')).toContain('red-400');
    expect(riskClass('HIGH')).toContain('blood');
    expect(riskClass('MEDIUM')).toContain('amber');
    expect(riskClass('LOW')).toContain('parchment-dim');
  });
});
