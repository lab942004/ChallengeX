import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** Shows a "0 / 500" counter when provided. */
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, showCount, className, id, value, maxLength, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const length = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-caps">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        value={value}
        maxLength={maxLength}
        className={cn(
          'field-input min-h-[120px] resize-y',
          error && 'border-blood-600 focus:border-blood-600 focus:ring-blood-600',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="text-xs text-blood-400">{error ?? ''}</span>
        {showCount && maxLength ? (
          <span
            className={cn(
              'text-xs tabular-nums',
              length >= maxLength ? 'text-blood-500' : 'text-parchment-dim/70',
            )}
          >
            {length} / {maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
});
