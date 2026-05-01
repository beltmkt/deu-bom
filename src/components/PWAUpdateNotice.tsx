import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export const PWAUpdateNotice: React.FC = () => {
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null);
  const [hasPendingUpdate, setHasPendingUpdate] = React.useState(false);
  const updateToastShown = React.useRef(false);
  const reloading = React.useRef(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      setHasPendingUpdate(true);
    },
    onOfflineReady() {
      toast.success('App pronto para uso offline.');
    },
    onRegisteredSW(_swScriptUrl, registration) {
      setRegistration(registration ?? null);
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
    },
  });

  React.useEffect(() => {
    if (!registration) return;

    const mapPendingUpdate = () => {
      if (registration.waiting) {
        setHasPendingUpdate(true);
        setNeedRefresh(true);
        return true;
      }

      return false;
    };

    const checkForUpdate = async () => {
      if (mapPendingUpdate()) return;
      if (!navigator.onLine) return;

      await registration.update();
      mapPendingUpdate();
    };

    void checkForUpdate();

    const intervalId = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate();
      }
    };

    registration.addEventListener('updatefound', mapPendingUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      registration.removeEventListener('updatefound', mapPendingUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [registration, setNeedRefresh]);

  React.useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const mapRegistrationOnOpen = async () => {
      const activeRegistration = await navigator.serviceWorker.getRegistration();

      if (activeRegistration?.waiting) {
        setRegistration(activeRegistration);
        setHasPendingUpdate(true);
        setNeedRefresh(true);
      }
    };

    void mapRegistrationOnOpen();

    const handleControllerChange = () => {
      if (reloading.current) return;

      reloading.current = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [setNeedRefresh]);

  const updatePending = needRefresh || hasPendingUpdate;

  React.useEffect(() => {
    if (!updatePending || updateToastShown.current) return;

    updateToastShown.current = true;
    toast.info('Nova versao disponivel. Atualize para usar o app mais recente.');
  }, [updatePending]);

  const handleUpdateNow = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    void updateServiceWorker(true);
  };

  if (!updatePending) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(max(1rem,env(safe-area-inset-bottom,0px))+5.25rem)] z-[90] md:bottom-5">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-card/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Atualizacao disponivel</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Reinicie o app para carregar a versao mais recente.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpdateNow}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <RefreshCcw className="h-4 w-4" />
          Atualizar
        </button>
      </div>
    </div>
  );
};
