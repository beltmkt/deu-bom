import React from 'react';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';

const NOTIFIED_KEY_PREFIX = 'deu-bom:pending-notifications';

const canUseSystemNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const PendingNotifications: React.FC = () => {
  const { user } = useAuth();
  const {
    transactions,
    settings,
    initialized,
    initialize,
  } = useFinanceStore();

  React.useEffect(() => {
    if (user && !initialized) {
      void initialize();
    }
  }, [initialize, initialized, user]);

  React.useEffect(() => {
    if (!user || !initialized || !settings.notificationsEnabled) return;

    const today = startOfToday();
    const pendingTransactions = transactions.filter((transaction) => {
      if (transaction.status !== 'pending') return false;

      const transactionDate = parseISO(transaction.date);
      return isBefore(transactionDate, today) || transaction.date === format(today, 'yyyy-MM-dd');
    });

    if (pendingTransactions.length === 0) return;

    const storageKey = `${NOTIFIED_KEY_PREFIX}:${user.id}:${format(today, 'yyyy-MM-dd')}`;
    const pendingSignature = pendingTransactions
      .map((transaction) => transaction.id)
      .sort()
      .join(',');

    if (window.localStorage.getItem(storageKey) === pendingSignature) return;

    window.localStorage.setItem(storageKey, pendingSignature);

    const total = pendingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const title = `${pendingTransactions.length} pendencia(s) financeira(s)`;
    const description = `Total em aberto: ${formatCurrency(total)}. Abra o app para revisar.`;

    toast.warning(title, {
      description,
      action: canUseSystemNotifications() && Notification.permission === 'default'
        ? {
            label: 'Permitir alertas',
            onClick: () => {
              void Notification.requestPermission();
            },
          }
        : undefined,
    });

    if (canUseSystemNotifications() && Notification.permission === 'granted') {
      new Notification(title, {
        body: description,
        icon: '/icon-192.png',
      });
    }
  }, [initialized, settings.notificationsEnabled, transactions, user]);

  return null;
};
