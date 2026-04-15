import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Calendar, ChevronDown, Loader2, Settings2 } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionForm } from '@/components/TransactionForm';
import { BottomNav } from '@/components/BottomNav';
import { useTransactions, useCategories, useFinanceStore, useFinanceLoading, useSettings } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import type { Transaction, TransactionType } from '@/types/finance';

const Transactions: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showCycleSettings, setShowCycleSettings] = useState(false);

  const transactions = useTransactions();
  const categories = useCategories();
  const loading = useFinanceLoading();
  const settings = useSettings();
  const { initialize, initialized, updateSettings } = useFinanceStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  const cycleDays = Array.from({ length: 28 }, (_, i) => i + 1);

  const filteredTransactions = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    return transactions
      .filter((t) => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      })
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (searchQuery) {
          const category = categories.find((c) => c.id === t.categoryId);
          const searchLower = searchQuery.toLowerCase();
          return (
            t.title.toLowerCase().includes(searchLower) ||
            category?.name.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, filterType, filterStatus, searchQuery, categories]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach((transaction) => {
      const dateKey = transaction.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    return Object.entries(groups);
  }, [filteredTransactions]);

  // Summary
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleMonthChange = (direction: number) => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 px-4 py-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Transações</h1>
          <button
            onClick={() => setShowCycleSettings(!showCycleSettings)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showCycleSettings ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Cycle Settings */}
        <AnimatePresence>
          {showCycleSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Ciclo Financeiro</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Dia de início do mês (útil para fechamento do cartão)
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {cycleDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => updateSettings({ cycleStartDay: day })}
                      className={`
                        py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          settings.cycleStartDay === day
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Month selector */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar transações..."
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 touch-btn w-10 h-10 rounded-lg flex items-center justify-center ${
              showFilters ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`
                    flex-1 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      filterType === type
                        ? type === 'income'
                          ? 'bg-income text-income-foreground'
                          : type === 'expense'
                          ? 'bg-expense text-expense-foreground'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {type === 'all' ? 'Todos' : type === 'income' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(['all', 'completed', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`
                    flex-1 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      filterStatus === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {status === 'all' ? 'Todos' : status === 'completed' ? 'Concluídos' : 'Pendentes'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      <main className="px-4 py-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-income/10 border border-income/20 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Receitas</p>
            <p className="font-mono font-semibold text-income text-sm">
              {formatCurrency(summary.income)}
            </p>
          </div>
          <div className="bg-expense/10 border border-expense/20 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Despesas</p>
            <p className="font-mono font-semibold text-expense text-sm">
              {formatCurrency(summary.expense)}
            </p>
          </div>
          <div
            className={`rounded-xl p-3 text-center border ${
              summary.balance >= 0
                ? 'bg-income/10 border-income/20'
                : 'bg-expense/10 border-expense/20'
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p
              className={`font-mono font-semibold text-sm ${
                summary.balance >= 0 ? 'text-income' : 'text-expense'
              }`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Transaction list */}
        {groupedTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-dashed border-border rounded-2xl p-8 text-center"
          >
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma transação</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? 'Nenhuma transação encontrada com essa busca'
                : 'Não há transações neste mês'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map(([date, dayTransactions], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
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
      </main>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setEditTransaction(null);
          setIsFormOpen(true);
        }}
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
      />
    </div>
  );
};

export default Transactions;
