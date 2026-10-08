import { ReactNode } from 'react';

/** Page heading used across admin pages. */
export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="admin-title text-xl text-sand-light sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-sand-dim">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyMessage({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-sand-dim">{message}</p>;
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-lg border border-brand-800/50 bg-brand-950/50 px-4 py-3 text-sm text-brand-400">
      {message}
    </div>
  );
}
