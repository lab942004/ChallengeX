import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, disabled, className, children, ...rest },
  ref,
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary:
      'bg-blood-800 text-parchment-light hover:bg-blood-600 hover:shadow-red-glow active:scale-[0.98]',
    ghost:
      'border border-blood-950 bg-obsidian/60 text-parchment-dim hover:border-blood-800 hover:text-parchment',
    danger:
      'border border-blood-600/60 bg-blood-950/60 text-blood-400 hover:bg-blood-800/40 hover:text-parchment-light',
    subtle: 'bg-transparent text-parchment-dim hover:text-parchment underline-offset-4 hover:underline',
  } as const;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-parchment/30 border-t-blood-500" />
      )}
      {children}
    </button>
  );
});
