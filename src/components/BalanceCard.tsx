import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactions } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import {
  filterTransactionsByMonth,
  summarizeTransactions,
} from '@/utils/transactionInsights';

interface BalanceCardProps {
  selectedMonth?: Date;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ selectedMonth = new Date() }) => {
  const transactions = useTransactions();

  const monthlyTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);
  const summary = useMemo(
    () => summarizeTransactions(monthlyTransactions),
    [monthlyTransactions]
  );

  return (
    <div className="space-y-4">
      {/* Main balance card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="balance-card relative"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Saldo do Mês</span>
          </div>
          
          <p className={`
            text-4xl font-bold font-mono currency-display
            ${summary.completedBalance >= 0 ? 'text-income' : 'text-expense'}
          `}>
            {formatCurrency(summary.completedBalance)}
          </p>

          {summary.pendingCount > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
              <Clock className="w-4 h-4 text-pending" />
              <span className="text-sm text-muted-foreground">
                Saldo Projetado:
              </span>
              <span className={`
                font-mono font-medium
                ${summary.balance >= 0 ? 'text-income' : 'text-expense'}
              `}>
                {formatCurrency(summary.balance)}
              </span>
              <span className="text-xs text-pending ml-auto">
                {summary.pendingCount} pendente{summary.pendingCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Income/Expense summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-income/10 border border-income/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-income/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-income" />
            </div>
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <p className="text-xl font-bold font-mono text-income">
            {formatCurrency(summary.completedIncome)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-expense/10 border border-expense/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-expense/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-expense" />
            </div>
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
          <p className="text-xl font-bold font-mono text-expense">
            {formatCurrency(summary.completedExpense)}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
