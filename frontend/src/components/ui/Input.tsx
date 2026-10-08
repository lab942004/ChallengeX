import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-caps">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'field-input',
          error && 'border-blood-600 focus:border-blood-600 focus:ring-blood-600',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-blood-400">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-parchment-dim/70">{hint}</p>}
    </div>
  );
});
