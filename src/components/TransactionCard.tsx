import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Clock, Trash2, icons } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { useFinanceStore, useCategoryById } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import { getRelativeDate } from '@/utils/dates';
import type { Transaction } from '@/types/finance';
import { useIsMobile } from '@/hooks/use-mobile';
import { TransactionDeleteModal } from '@/components/TransactionDeleteModal';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onEdit }) => {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const isMobile = useIsMobile();
  
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
          <div className="flex items-center gap-3">
            {/* Status toggle */}
            <button
              onClick={handleStatusToggle}
              className={`
                touch-btn w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                transition-all duration-200
                ${isPending 
                  ? 'bg-pending/20 border-2 border-pending' 
                  : 'bg-income/20 border-2 border-income'
                }
              `}
            >
              {isPending ? (
                <Clock className="w-4 h-4 text-pending" />
              ) : (
                <Check className="w-4 h-4 text-income" />
              )}
            </button>

            {/* Category icon */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: category?.color + '20' }}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ color: category?.color }}
              />
            </div>

            {/* Transaction details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate text-sm">
                {transaction.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {category?.name}
                </span>
                {transaction.installmentNumber && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {transaction.installmentNumber}/{transaction.totalInstallments}
                  </span>
                )}
              </div>
            </div>

            {/* Amount and date */}
            <div className="text-right flex-shrink-0">
              <p className={`
                font-mono font-semibold text-sm
                ${isIncome ? 'text-income' : 'text-expense'}
                ${isPending ? 'opacity-60' : ''}
              `}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getRelativeDate(transaction.date)}
              </p>
            </div>

            {/* Discrete delete button */}
            <button
              onClick={handleDeleteClick}
              className="ml-1 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all flex-shrink-0 sm:opacity-40"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </button>
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
