import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
}

export const AppShell = ({ children, className, mainClassName }: AppShellProps) => {
  return (
    <div
      className={cn(
        'min-h-screen min-h-[100dvh] bg-background pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pl-[var(--app-sidebar-width,88px)]',
        className
      )}
    >
      <main
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-[calc(1.5rem+env(safe-area-inset-top,0px))] sm:px-6 lg:px-8',
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
};
