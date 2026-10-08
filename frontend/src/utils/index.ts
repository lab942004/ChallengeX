/** Merge conditional class names. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

export function timeAgo(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function verdictClass(verdict: string | null | undefined): string {
  switch (verdict) {
    case 'BUILD':
      return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
    case 'VALIDATE':
      return 'text-amber-300 border-amber-500/40 bg-amber-500/10';
    case 'PIVOT':
      return 'text-sky-300 border-sky-500/40 bg-sky-500/10';
    case 'KILL':
      return 'text-blood-400 border-blood-600/50 bg-blood-800/20';
    default:
      return 'text-parchment-dim border-blood-950 bg-obsidian';
  }
}

export function riskClass(risk: string | null | undefined): string {
  switch (risk) {
    case 'CRITICAL':
      return 'text-red-400 border-red-500/50 bg-red-500/10';
    case 'HIGH':
      return 'text-blood-400 border-blood-600/50 bg-blood-800/20';
    case 'MEDIUM':
      return 'text-amber-300 border-amber-500/40 bg-amber-500/10';
    default:
      return 'text-parchment-dim border-blood-950 bg-obsidian';
  }
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
