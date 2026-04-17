import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
}

export const AppShell = ({ children, className, mainClassName }: AppShellProps) => {
  return (
    <div className={cn('min-h-screen bg-background pb-8 md:pl-[88px]', className)}>
      <main
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8',
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
};
