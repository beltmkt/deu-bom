import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, List, PieChart, Settings, PartyPopper, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/transactions', icon: List, label: 'Transações' },
  { to: '/analytics', icon: BarChart3, label: 'Análise' },
  { to: '/leisure', icon: PartyPopper, label: 'Festômetro' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-1 py-2 px-3 min-w-[56px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] relative z-10 transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
