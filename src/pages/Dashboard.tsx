import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Loader2, ChevronDown } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionForm } from '@/components/TransactionForm';
import { BottomNav } from '@/components/BottomNav';
import { useTransactions, useFinanceStore, useFinanceLoading } from '@/stores/financeStore';
import type { Transaction, TransactionType } from '@/types/finance';

const Dashboard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<TransactionType>('expense');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const transactions = useTransactions();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((state) => state.initialize);
  const initialized = useFinanceStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  // Filter transactions by selected month
  const monthlyTransactions = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    return transactions.filter((t) => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, selectedMonth]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const sorted = [...monthlyTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: { [key: string]: Transaction[] } = {};
    
    sorted.forEach((transaction) => {
      const dateKey = transaction.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups).slice(0, 7); // Show last 7 days with transactions
  }, [monthlyTransactions]);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const handleAddTransaction = (type: TransactionType) => {
    setDefaultType(type);
    setEditTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleMonthChange = (direction: number) => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 px-4 py-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Finanças</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAddTransaction('income')}
              className="touch-btn w-12 h-12 rounded-full bg-income/10 flex items-center justify-center border border-income/20"
            >
              <TrendingUp className="w-5 h-5 text-income" />
            </button>
            <button
              onClick={() => handleAddTransaction('expense')}
              className="touch-btn w-12 h-12 rounded-full bg-expense/10 flex items-center justify-center border border-expense/20"
            >
              <TrendingDown className="w-5 h-5 text-expense" />
            </button>
          </div>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleMonthChange(-1)}
            className="touch-btn w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <span className="font-semibold capitalize">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => handleMonthChange(1)}
            className="touch-btn w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 -rotate-90" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <BalanceCard selectedMonth={selectedMonth} />

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transações do Mês</h2>
          </div>

          {groupedTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-dashed border-border rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhuma transação</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Não há transações neste mês
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleAddTransaction('income')}
                  className="px-4 py-2 bg-income/10 text-income rounded-xl font-medium border border-income/20"
                >
                  + Receita
                </button>
                <button
                  onClick={() => handleAddTransaction('expense')}
                  className="px-4 py-2 bg-expense/10 text-expense rounded-xl font-medium border border-expense/20"
                >
                  + Despesa
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {groupedTransactions.map(([date, dayTransactions], groupIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                    {formatDateHeader(date)}
                  </h3>
                  <div className="space-y-3">
                    {dayTransactions.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleAddTransaction('expense')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditTransaction(null);
        }}
        editTransaction={editTransaction}
        defaultType={defaultType}
      />
    </div>
  );
};

export default Dashboard;
