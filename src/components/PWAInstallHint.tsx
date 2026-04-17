import React from 'react';
import { Download, Share2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'deu-bom:pwa-install-dismissed';

const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

export const PWAInstallHint: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(true);
  const [standalone, setStandalone] = React.useState(false);

  const isMobile = React.useMemo(
    () =>
      typeof window !== 'undefined' &&
      /android|iphone|ipad|ipod|mobile/i.test(window.navigator.userAgent),
    []
  );

  const isIOS = React.useMemo(
    () =>
      typeof window !== 'undefined' &&
      /iphone|ipad|ipod/i.test(window.navigator.userAgent),
    []
  );

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const syncStandaloneState = () => {
      const nextStandalone = isStandaloneMode();
      setStandalone(nextStandalone);
      document.documentElement.classList.toggle('app-standalone', nextStandalone);
    };

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === 'true');
    syncStandaloneState();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => syncStandaloneState();
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', syncStandaloneState);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', syncStandaloneState);
    };
  }, []);

  const hideHint = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    }
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === 'accepted') {
      hideHint();
      setDeferredPrompt(null);
    }
  };

  if (!isMobile || standalone || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] z-[80] md:hidden">
      <div className="rounded-[24px] border border-border/70 bg-card/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Instale o app</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Pela tela inicial o app abre sem barra de URL e fica com cara de app nativo.
            </p>
          </div>

          <button
            onClick={hideHint}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/70 text-muted-foreground"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Download className="h-4 w-4" />
              Instalar app
            </button>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
              {isIOS
                ? 'No iPhone, toque em Compartilhar e depois em Adicionar a Tela de Inicio.'
                : 'No Android ou Xiaomi, abra o menu do navegador e escolha Instalar app ou Adicionar a tela inicial.'}
            </div>
          )}

          {isIOS ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
