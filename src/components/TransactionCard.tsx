import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, GripVertical, Trash2, icons } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { useFinanceStore, useCategoryById } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import { getRelativeDate } from '@/utils/dates';
import type { Transaction } from '@/types/finance';
import {
  TransactionDeleteModal,
  TransactionUpdateModal,
} from '@/components/TransactionDeleteModal';
import { toast } from 'sonner';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  compact?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (transaction: Transaction) => void;
  onDragEnd?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  compact = false,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) => {
  const didDragRef = React.useRef(false);
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showStatusScopeModal, setShowStatusScopeModal] = React.useState(false);
  const [isResolvingDelete, setIsResolvingDelete] = React.useState(false);
  const [isResolvingStatus, setIsResolvingStatus] = React.useState(false);
  const category = useCategoryById(transaction.categoryId);
  const { toggleTransactionStatus, updateTransaction, deleteTransaction } = useFinanceStore();

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
    if (isRecurring) {
      setShowStatusScopeModal(true);
      return;
    }

    toggleTransactionStatus(transaction.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (scope: 'single' | 'future' | 'all') => {
    if (isResolvingDelete) return;

    setIsResolvingDelete(true);
    try {
      const success =
        scope === 'single'
          ? await deleteTransaction(transaction.id, false)
          : scope === 'future'
            ? await deleteTransaction(transaction.id, true)
            : await deleteTransaction(transaction.id, false, true);

      if (!success) return;

      toast.success('Transacao excluida!');
      setShowDeleteModal(false);
      setIsDeleting(true);
    } finally {
      setIsResolvingDelete(false);
    }
  };

  const handleStatusScopeConfirm = async (scope: 'single' | 'future' | 'all') => {
    if (isResolvingStatus) return;

    const nextStatus = transaction.status === 'completed' ? 'pending' : 'completed';

    setIsResolvingStatus(true);
    try {
      const success =
        scope === 'single'
          ? await updateTransaction(transaction.id, { status: nextStatus }, false)
          : scope === 'future'
            ? await updateTransaction(transaction.id, { status: nextStatus }, true)
            : await updateTransaction(transaction.id, { status: nextStatus }, false, true);

      if (!success) return;

      toast.success('Status atualizado!');
      setShowStatusScopeModal(false);
    } finally {
      setIsResolvingStatus(false);
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
        draggable={draggable}
        onDragStart={(event) => {
          didDragRef.current = true;
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', transaction.id);
          onDragStart?.(transaction);
        }}
        onDragEnd={() => {
          window.setTimeout(() => {
            didDragRef.current = false;
          }, 0);
          onDragEnd?.();
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDeleting ? 0 : isDragging ? 0.55 : 1,
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
          onClick={() => {
            if (didDragRef.current) return;
            onEdit(transaction);
          }}
          className={`
            relative bg-card border border-border rounded-xl ${compact ? 'p-3' : 'p-4'}
            active:scale-[0.98] transition-transform duration-100
            cursor-pointer group ${draggable ? 'select-none' : ''}
          `}
        >
          <div className={compact ? 'flex items-start gap-2.5' : 'flex items-start gap-3'}>
            <div
              className={`mt-0.5 flex items-center justify-center rounded-full flex-shrink-0 ${
                compact ? 'h-8 w-8' : 'h-9 w-9'
              }`}
              style={{ backgroundColor: category?.color + '20' }}
            >
              <IconComponent
                className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
                style={{ color: category?.color }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-foreground">
                    {transaction.title}
                  </h4>
                  <div className="mt-0.5 flex min-w-0 items-center gap-2">
                    <span className="truncate text-xs text-muted-foreground">
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
                        font-mono ${compact ? 'text-xs' : 'text-sm'} font-semibold
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

              <div className={`${compact ? 'mt-2' : 'mt-3'} flex items-center justify-between gap-3`}>
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
                  title={toggleLabel}
                  className={`touch-btn relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    isPending
                      ? 'border-border/60 bg-transparent text-muted-foreground hover:bg-muted/50'
                      : isIncome
                      ? 'border-income/25 bg-income/10 text-income'
                      : 'border-primary/25 bg-primary/10 text-primary'
                  }`}
                >
                  {isPending ? <Circle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                  <span className="sr-only">{toggleLabel}</span>
                </button>
              </div>

              {draggable ? (
                <div className="mt-2 flex items-center justify-end text-muted-foreground/60">
                  <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      <TransactionDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (isResolvingDelete) return;
          setShowDeleteModal(false);
        }}
        onConfirm={handleDeleteConfirm}
        isRecurring={isRecurring}
        transactionTitle={transaction.title}
        isSubmitting={isResolvingDelete}
      />

      <TransactionUpdateModal
        isOpen={showStatusScopeModal}
        onClose={() => {
          if (isResolvingStatus) return;
          setShowStatusScopeModal(false);
        }}
        onConfirm={handleStatusScopeConfirm}
        transactionTitle={transaction.title}
        isSubmitting={isResolvingStatus}
      />
    </>
  );
};
