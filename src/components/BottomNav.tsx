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

const STORAGE_KEY = 'deu-bom:sidebar-collapsed';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const asideRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedState = window.localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const sidebarWidth = isMobile ? '0px' : isCollapsed ? '88px' : '272px';
    const bottomNavHeight = isMobile ? '84px' : '0px';
    document.documentElement.style.setProperty('--app-sidebar-width', sidebarWidth);
    document.documentElement.style.setProperty('--app-bottom-nav-height', bottomNavHeight);

    return () => {
      document.documentElement.style.setProperty('--app-sidebar-width', '88px');
      document.documentElement.style.setProperty('--app-bottom-nav-height', '0px');
    };
  }, [isCollapsed, isMobile]);

  React.useEffect(() => {
    if (isMobile || isCollapsed) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (asideRef.current?.contains(target)) return;

      setIsCollapsed(true);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isCollapsed, isMobile]);

  return (
    <>
      {isMobile ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/70 bg-card/95 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur-xl md:hidden"
          aria-label="Navegacao principal"
        >
          <div className="grid grid-cols-6 gap-1">
            {navItems.map((item) => {
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
        className={cn(
          'fixed inset-y-0 left-0 z-[60] hidden flex-col border-r border-border/70 bg-card/96 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] shadow-[var(--shadow-md)] backdrop-blur-xl transition-all duration-200 md:flex',
          isCollapsed ? 'w-[88px]' : 'w-[272px]'
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
          <div
            className={cn(
              'flex items-center gap-3 overflow-hidden transition-all',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              DB
            </div>
            <div className={cn('min-w-0', isCollapsed && 'hidden')}>
              <p className="text-sm font-semibold text-foreground">Deu Bom</p>
              <p className="text-xs text-muted-foreground">Financas sem erro</p>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
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
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.label : undefined}
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
                    isCollapsed && 'hidden'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className={cn('border-t border-border/60 px-4 py-4', isCollapsed && 'px-3')}>
          <div
            className={cn(
              'rounded-2xl bg-muted/60 p-3',
              isCollapsed && 'flex items-center justify-center p-2'
            )}
          >
            <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
            <div className={cn('mt-2 text-xs text-muted-foreground', isCollapsed && 'hidden')}>
              Abra o dashboard para acompanhar receitas, despesas e meses com maior gasto.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
