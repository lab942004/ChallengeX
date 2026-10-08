import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useId,
} from 'react';
import { cn } from '../../utils';

export function Button({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
}) {
  const variants = { primary: 'btn-primary', ghost: 'btn-ghost', danger: 'btn-danger' };
  return (
    <button
      className={cn(variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sand/30 border-t-brand-500" />
      )}
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }) {
  const autoId = useId();
  const inputId = id ?? rest.name ?? autoId;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="admin-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn('admin-input', error && 'border-brand-600', className)}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-brand-400">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-sand-dim/60">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  className,
  children,
  id,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const autoId = useId();
  const selectId = id ?? rest.name ?? autoId;
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="admin-label">
          {label}
        </label>
      )}
      <select id={selectId} className={cn('admin-input', className)} {...rest}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({
  label,
  className,
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const autoId = useId();
  const areaId = id ?? rest.name ?? autoId;
  return (
    <div>
      {label && (
        <label htmlFor={areaId} className="admin-label">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={cn('admin-input min-h-[100px] resize-y', className)}
        {...rest}
      />
    </div>
  );
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        className ?? 'border-white/10 bg-ink-800 text-sand-dim',
      )}
    >
      {children}
    </span>
  );
}
