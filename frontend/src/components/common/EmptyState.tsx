import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, message, action, icon }: EmptyStateProps) {
  return (
    <div className="card-realm flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && <div className="text-blood-600">{icon}</div>}
      <h3 className="title-cinzel text-sm text-parchment-light sm:text-base">{title}</h3>
      {message && <p className="max-w-md text-sm text-parchment-dim">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
