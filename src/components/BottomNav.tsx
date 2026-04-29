import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  KanbanSquare,
  PartyPopper,
  PiggyBank,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/transactions', icon: KanbanSquare, label: 'Financas' },
  { to: '/festometro', icon: PartyPopper, label: 'Festometro' },
  { to: '/budgets', icon: PiggyBank, label: 'Metas' },
  { to: '/analytics', icon: BarChart3, label: 'Dashboard' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

const mobileNavItems = navItems.filter(
  (item) => item.to !== '/budgets' && item.to !== '/analytics'
);

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const asideRef = React.useRef<HTMLElement | null>(null);
  const isExpanded = !isMobile && (isHovered || isPinned);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const sidebarWidth = isMobile ? '0px' : '88px';
    const bottomNavHeight = isMobile ? '84px' : '0px';
    document.documentElement.style.setProperty('--app-sidebar-width', sidebarWidth);
    document.documentElement.style.setProperty('--app-bottom-nav-height', bottomNavHeight);

    return () => {
      document.documentElement.style.setProperty('--app-sidebar-width', '88px');
      document.documentElement.style.setProperty('--app-bottom-nav-height', '0px');
    };
  }, [isMobile]);

  return (
    <>
      {isMobile ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/70 bg-card/95 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur-xl md:hidden"
          aria-label="Navegacao principal"
        >
          <div className="grid grid-cols-4 gap-1">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate leading-none">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      ) : null}

      <aside
        ref={asideRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget as Node | null;
          if (nextTarget && asideRef.current?.contains(nextTarget)) return;
          setIsHovered(false);
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-[60] hidden flex-col overflow-hidden border-r border-border/70 bg-card/96 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl transition-[width,box-shadow] duration-200 md:flex',
          isExpanded ? 'w-[272px] shadow-[var(--shadow-lg)]' : 'w-[88px] shadow-[var(--shadow-md)]'
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
          <div
            className={cn(
              'flex items-center gap-3 overflow-hidden transition-all',
              !isExpanded && 'justify-center'
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              DB
            </div>
            <div className={cn('min-w-0', !isExpanded && 'hidden')}>
              <p className="text-sm font-semibold text-foreground">Deu Bom</p>
              <p className="text-xs text-muted-foreground">Financas sem erro</p>
            </div>
          </div>

          <button
            onClick={() => setIsPinned((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            aria-label={isPinned ? 'Desafixar sidebar' : 'Fixar sidebar aberta'}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                  !isExpanded && 'justify-center px-0'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                {isActive ? (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  />
                ) : null}

                <item.icon className="relative z-10 h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    'relative z-10 truncate font-medium',
                    !isExpanded && 'hidden'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border/60 px-4 py-4">
          <div className="flex h-10 items-center justify-center rounded-2xl bg-muted/40 text-primary">
            <BarChart3 className="h-4 w-4 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
