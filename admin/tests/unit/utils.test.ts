import { describe, expect, it } from 'vitest';
import {
  cn,
  formatDate,
  initials,
  roleBadgeClass,
  severityBadgeClass,
  verdictBadgeClass,
} from '../../src/utils';

describe('cn', () => {
  it('joins truthy classes', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });
});

describe('formatDate', () => {
  it('formats valid dates and dashes invalid ones', () => {
    expect(formatDate('2026-02-01T00:00:00.000Z')).not.toBe('—');
    expect(formatDate('nope')).toBe('—');
  });
});

describe('initials', () => {
  it('derives initials from a full name', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
    expect(initials('  single  ')).toBe('S');
    expect(initials('')).toBe('');
  });
});

describe('badge classes', () => {
  it('maps roles to distinct styles', () => {
    expect(roleBadgeClass('SUPER_ADMIN')).toContain('brand');
    expect(roleBadgeClass('ADMIN')).toContain('amber');
    expect(roleBadgeClass('USER')).toContain('sand-dim');
  });

  it('maps verdicts to distinct styles', () => {
    expect(verdictBadgeClass('BUILD')).toContain('emerald');
    expect(verdictBadgeClass('KILL')).toContain('brand');
    expect(verdictBadgeClass(null)).toContain('sand-dim');
  });

  it('maps severities to distinct styles', () => {
    expect(severityBadgeClass('CRITICAL')).toContain('red');
    expect(severityBadgeClass('HIGH')).toContain('brand');
    expect(severityBadgeClass('LOW')).toContain('sand-dim');
  });
});
