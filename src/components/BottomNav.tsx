import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, KanbanSquare, PiggyBank, Settings, PartyPopper, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/transactions', icon: KanbanSquare, label: 'Financas' },
  { to: '/festometro', icon: PartyPopper, label: 'Festometro' },
  { to: '/budgets', icon: PiggyBank, label: 'Metas' },
  { to: '/analytics', icon: BarChart3, label: 'Dashboard' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex w-full items-center justify-around rounded-[22px] border border-border/80 bg-card/95 px-2 pt-2 pb-1 shadow-[var(--shadow-md)] backdrop-blur-xl sm:max-w-max sm:gap-2 sm:px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex min-w-[52px] flex-col items-center gap-1 px-2 py-2 sm:min-w-[68px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`relative z-10 h-5 w-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] transition-colors ${
                    isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
