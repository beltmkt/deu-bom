import React from 'react';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background md:pl-[var(--app-sidebar-width,88px)]">
      <main className="pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
