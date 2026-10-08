export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function roleBadgeClass(role: string): string {
  if (role === 'SUPER_ADMIN') return 'border-brand-600/60 bg-brand-950/70 text-brand-400';
  if (role === 'ADMIN') return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
  return 'border-white/10 bg-ink-800 text-sand-dim';
}

export function verdictBadgeClass(verdict: string | null): string {
  switch (verdict) {
    case 'BUILD':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    case 'VALIDATE':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
    case 'PIVOT':
      return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
    case 'KILL':
      return 'border-brand-600/50 bg-brand-950/60 text-brand-400';
    default:
      return 'border-white/10 bg-ink-800 text-sand-dim';
  }
}

export function severityBadgeClass(severity: string): string {
  if (severity === 'CRITICAL') return 'border-red-500/50 bg-red-500/10 text-red-400';
  if (severity === 'HIGH') return 'border-brand-600/50 bg-brand-950/60 text-brand-400';
  if (severity === 'MEDIUM') return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
  return 'border-white/10 bg-ink-800 text-sand-dim';
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
