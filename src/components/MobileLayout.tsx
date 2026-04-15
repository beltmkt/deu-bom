import React from 'react';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
