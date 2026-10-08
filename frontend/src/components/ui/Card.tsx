import { HTMLAttributes } from 'react';
import { cn } from '../../utils';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card-realm p-5 sm:p-6', className)} {...rest}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-blood-950 bg-obsidian px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-parchment-dim',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('title-cinzel text-lg text-parchment-light sm:text-xl', className)}
      {...rest}
    >
      {children}
    </h2>
  );
}
