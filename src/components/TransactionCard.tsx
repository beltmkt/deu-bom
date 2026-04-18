import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Trash2, icons } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { useFinanceStore, useCategoryById } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import { getRelativeDate } from '@/utils/dates';
import type { Transaction } from '@/types/finance';
import { TransactionDeleteModal } from '@/components/TransactionDeleteModal';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onEdit }) => {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const category = useCategoryById(transaction.categoryId);
  const { toggleTransactionStatus, deleteTransaction } = useFinanceStore();

  const isRecurring = !!(transaction.groupId || transaction.parentTransactionId || (transaction.totalInstallments && transaction.totalInstallments > 1));

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === 'Left') {
        setSwipeOffset(Math.min(80, Math.abs(e.deltaX)));
      }
    },
    onSwipedLeft: () => {
      if (swipeOffset >= 60) {
        setShowDeleteModal(true);
      }
      setSwipeOffset(0);
    },
    onSwipedRight: () => {
      setSwipeOffset(0);
    },
    trackMouse: false,
    trackTouch: true,
  });

  React.useEffect(() => {
    if (isDeleting) {
      const timer = setTimeout(() => {
        // Deletion already handled by modal
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isDeleting]);

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTransactionStatus(transaction.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (scope: 'single' | 'future' | 'all') => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    
    if (scope === 'single') {
      await deleteTransaction(transaction.id, false);
    } else if (scope === 'future') {
      await deleteTransaction(transaction.id, true);
    } else if (scope === 'all') {
      // Delete all in the group
      await deleteTransaction(transaction.id, false, true);
    }
  };

  const IconComponent =
    (category?.icon ? icons[category.icon as keyof typeof icons] : undefined) || Circle;

  const isIncome = transaction.type === 'income';
  const isPending = transaction.status === 'pending';
  const statusLabel = isIncome
    ? isPending
      ? 'Pendente'
      : 'Recebido'
    : isPending
    ? 'Pendente'
    : 'Pago';
  const toggleLabel = isIncome
    ? isPending
      ? 'Marcar como recebido'
      : 'Marcar como pendente'
    : isPending
    ? 'Marcar como pago'
    : 'Marcar como pendente';

  return (
    <>
      <motion.div
        {...handlers}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDeleting ? 0 : 1, 
          y: isDeleting ? -20 : 0,
          x: -swipeOffset,
        }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden"
      >
        {/* Delete background */}
        <div 
          className="absolute inset-y-0 right-0 bg-destructive flex items-center justify-center rounded-xl"
          style={{ width: swipeOffset + 20 }}
        >
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
        </div>

        {/* Card content */}
        <div
          onClick={() => onEdit(transaction)}
          className={`
            relative bg-card border border-border rounded-xl p-4
            active:scale-[0.98] transition-transform duration-100
            cursor-pointer group
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0"
              style={{ backgroundColor: category?.color + '20' }}
            >
              <IconComponent
                className="h-4 w-4"
                style={{ color: category?.color }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-foreground">
                    {transaction.title}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {category?.name}
                    </span>
                    {transaction.installmentNumber && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {transaction.installmentNumber}/{transaction.totalInstallments}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`
                        font-mono text-sm font-semibold
                        ${isIncome ? 'text-income' : 'text-expense'}
                        ${isPending ? 'opacity-60' : ''}
                      `}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getRelativeDate(transaction.date)}
                    </p>
                  </div>

                  <button
                    onClick={handleDeleteClick}
                    className="ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100 sm:opacity-40"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isPending
                      ? 'bg-pending/10 text-pending'
                      : isIncome
                      ? 'bg-income/10 text-income'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {statusLabel}
                </span>

                <button
                  onClick={handleStatusToggle}
                  aria-label={toggleLabel}
                  className={`touch-btn relative flex h-5 w-9 flex-shrink-0 items-center rounded-full border px-1 transition-all duration-200 ${
                    isPending
                      ? 'border-border/70 bg-muted/40'
                      : isIncome
                      ? 'border-income/15 bg-income/5'
                      : 'border-primary/15 bg-primary/5'
                  }`}
                >
                  <span
                    className={`absolute left-1 flex h-3 w-3 items-center justify-center rounded-full shadow-sm transition-all duration-200 ${
                      isPending
                        ? 'translate-x-0 bg-background text-muted-foreground'
                        : 'translate-x-3 bg-background text-primary'
                    }`}
                  >
                    <Check className="h-2 w-2" />
                  </span>
                  <span className="sr-only">{toggleLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <TransactionDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isRecurring={isRecurring}
        transactionTitle={transaction.title}
      />
    </>
  );
};
