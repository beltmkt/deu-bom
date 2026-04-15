import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export const SurfaceCard = ({ children, className }: SurfaceCardProps) => {
  return (
    <section
      className={cn(
        'rounded-[24px] border border-border/70 bg-card p-5 shadow-[var(--shadow-sm)]',
        className
      )}
    >
      {children}
    </section>
  );
};
