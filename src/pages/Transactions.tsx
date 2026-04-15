import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Filter,
  Loader2,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomNav } from '@/components/BottomNav';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionForm } from '@/components/TransactionForm';
import {
  useCategories,
  useFinanceLoading,
  useFinanceStore,
  useSettings,
  useTransactions,
} from '@/stores/financeStore';
import {
  filterTransactionsByMonth,
  groupTransactionsByDate,
  summarizeTransactions,
} from '@/utils/transactionInsights';
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

  const cycleDays = Array.from({ length: 28 }, (_, index) => index + 1);

  const monthTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const filteredTransactions = useMemo(() => {
    return monthTransactions
      .filter((transaction) => {
        if (filterType !== 'all' && transaction.type !== filterType) return false;
        if (filterStatus !== 'all' && transaction.status !== filterStatus) return false;

        if (!searchQuery) return true;

        const category = categories.find(
          (item) => item.id === transaction.categoryId
        );
        const term = searchQuery.toLowerCase();

        return (
          transaction.title.toLowerCase().includes(term) ||
          category?.name.toLowerCase().includes(term)
        );
      })
      .sort(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime()
      );
  }, [categories, filterStatus, filterType, monthTransactions, searchQuery]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions]
  );

  const summary = useMemo(
    () => summarizeTransactions(filteredTransactions),
    [filteredTransactions]
  );

  const handleMonthChange = (direction: number) => {
    setSelectedMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + direction, 1)
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando transacoes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/88 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Operacao
              </p>
              <h1 className="text-2xl font-semibold">Central de transacoes</h1>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Filtre, revise e corrija movimentos com mais contexto e menos ruido.
              </p>
            </div>

            <button
              onClick={() => setShowCycleSettings((current) => !current)}
              className={`touch-btn h-12 rounded-2xl border px-4 ${
                showCycleSettings
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/60 text-muted-foreground'
              }`}
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>

          <MonthSwitcher
            selectedMonth={selectedMonth}
            onChange={handleMonthChange}
            className="mb-4"
          />

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por descricao ou categoria"
              className="w-full rounded-2xl border border-border bg-background pl-12 pr-14 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => setShowFilters((current) => !current)}
              className={`absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl ${
                showFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCycleSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden px-1 pt-3"
            >
              <div className="rounded-[24px] border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold">Ciclo financeiro</h2>
                    <p className="text-xs text-muted-foreground">
                      Ajuste o dia de virada para refletir cartao ou fechamento.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {cycleDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => updateSettings({ cycleStartDay: day })}
                      className={`rounded-xl py-2 text-sm font-medium transition-colors ${
                        settings.cycleStartDay === day
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-income/20 bg-income/10 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Receitas
            </p>
            <p className="mt-2 font-mono text-sm font-semibold text-income">
              {formatCurrency(summary.income)}
            </p>
          </div>

          <div className="rounded-2xl border border-expense/20 bg-expense/10 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Despesas
            </p>
            <p className="mt-2 font-mono text-sm font-semibold text-expense">
              {formatCurrency(summary.expense)}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-4 text-center ${
              summary.balance >= 0
                ? 'border-primary/20 bg-primary/10'
                : 'border-expense/20 bg-expense/10'
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Saldo
            </p>
            <p
              className={`mt-2 font-mono text-sm font-semibold ${
                summary.balance >= 0 ? 'text-primary' : 'text-expense'
              }`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </section>

        <AnimatePresence>
          {showFilters && (
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-[28px] border border-border bg-card p-5"
            >
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Filtros
                </p>
                <h2 className="mt-1 text-lg font-semibold">Refinar visualizacao</h2>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                        filterType === type
                          ? type === 'income'
                            ? 'bg-income text-income-foreground'
                            : type === 'expense'
                            ? 'bg-expense text-expense-foreground'
                            : 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {type === 'all'
                        ? 'Todos'
                        : type === 'income'
                        ? 'Receitas'
                        : 'Despesas'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {(['all', 'completed', 'pending'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {status === 'all'
                        ? 'Todos'
                        : status === 'completed'
                        ? 'Concluidos'
                        : 'Pendentes'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {groupedTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center"
          >
            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Nenhuma transacao encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? 'Tente outro termo ou remova alguns filtros.'
                : 'Este periodo ainda nao possui lancamentos visiveis.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map(([date, dayTransactions], index) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <h3 className="mb-3 text-sm font-medium capitalize text-muted-foreground">
                  {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <div className="space-y-3">
                  {dayTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={setEditTransaction}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditTransaction(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <BottomNav />

      <TransactionForm
        isOpen={isFormOpen || !!editTransaction}
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
