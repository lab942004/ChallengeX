import { ReactNode } from 'react';
import { cn } from '../../utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  icon?: ReactNode;
}

/** Dashboard statistic tile. */
export function StatCard({ label, value, hint, accent, icon }: StatCardProps) {
  return (
    <div
      className={cn(
        'panel p-4',
        accent && 'border-brand-800/50 bg-brand-950/20',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sand-dim">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-sand-light">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-sand-dim/70">{hint}</p>}
    </div>
  );
}
