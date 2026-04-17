import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Filter,
  Loader2,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  WalletCards,
} from 'lucide-react';
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
  sortTransactionsByDateDesc,
  summarizeTransactions,
} from '@/utils/transactionInsights';
import { formatCurrency } from '@/utils/currency';
import type { Transaction, TransactionType } from '@/types/finance';

type ColumnId = 'pay' | 'receive' | 'done';

interface KanbanColumn {
  id: ColumnId;
  title: string;
  description: string;
  total: number;
  count: number;
  empty: string;
  tone: string;
  items: Transaction[];
}

const Transactions: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<'all' | string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showCycleSettings, setShowCycleSettings] = useState(false);
  const [defaultType, setDefaultType] = useState<TransactionType>('expense');

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
    return sortTransactionsByDateDesc(
      monthTransactions.filter((transaction) => {
        if (filterType !== 'all' && transaction.type !== filterType) return false;
        if (filterStatus !== 'all' && transaction.status !== filterStatus) return false;
        if (filterCategoryId !== 'all' && transaction.categoryId !== filterCategoryId) return false;

        if (!searchQuery) return true;

        const category = categories.find((item) => item.id === transaction.categoryId);
        const term = searchQuery.toLowerCase();

        return (
          transaction.title.toLowerCase().includes(term) ||
          category?.name.toLowerCase().includes(term) ||
          transaction.notes?.toLowerCase().includes(term)
        );
      })
    );
  }, [categories, filterCategoryId, filterStatus, filterType, monthTransactions, searchQuery]);

  const summary = useMemo(
    () => summarizeTransactions(filteredTransactions),
    [filteredTransactions]
  );

  const kanbanColumns = useMemo<KanbanColumn[]>(() => {
    const buildColumn = (
      id: ColumnId,
      title: string,
      description: string,
      empty: string,
      tone: string,
      predicate: (transaction: Transaction) => boolean
    ) => {
      const items = filteredTransactions.filter(predicate);

      return {
        id,
        title,
        description,
        empty,
        tone,
        items,
        count: items.length,
        total: items.reduce((total, transaction) => total + transaction.amount, 0),
      };
    };

    return [
      buildColumn(
        'pay',
        'A pagar',
        'Despesas pendentes para voce fechar.',
        'Nenhuma despesa pendente nesse filtro.',
        'border-expense/20 bg-expense/10',
        (transaction) =>
          transaction.type === 'expense' && transaction.status === 'pending'
      ),
      buildColumn(
        'receive',
        'A receber',
        'Receitas ainda abertas no periodo.',
        'Nenhuma receita aguardando entrada.',
        'border-income/20 bg-income/10',
        (transaction) =>
          transaction.type === 'income' && transaction.status === 'pending'
      ),
      buildColumn(
        'done',
        'Concluido',
        'Tudo que ja foi confirmado.',
        'Nada concluido com os filtros atuais.',
        'border-primary/20 bg-primary/10',
        (transaction) => transaction.status === 'completed'
      ),
    ];
  }, [filteredTransactions]);

  const handleMonthChange = (direction: number) => {
    setSelectedMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + direction, 1)
    );
  };

  const openForm = (type: TransactionType) => {
    setDefaultType(type);
    setEditTransaction(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando financas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8 md:pl-[88px]">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Financas
              </p>
              <h1 className="text-2xl font-semibold">Fluxo em Kanban</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Organize o mes em colunas simples: o que pagar, o que receber e o que ja foi concluido.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openForm('income')}
                className="rounded-2xl border border-income/20 bg-income/10 px-4 py-3 text-sm font-medium text-income"
              >
                Nova receita
              </button>
              <button
                onClick={() => openForm('expense')}
                className="rounded-2xl border border-expense/20 bg-expense/10 px-4 py-3 text-sm font-medium text-expense"
              >
                Nova despesa
              </button>
              <button
                onClick={() => setShowCycleSettings((current) => !current)}
                className={`rounded-2xl border px-4 ${
                  showCycleSettings
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/60 text-muted-foreground'
                }`}
              >
                <Settings2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <MonthSwitcher
            selectedMonth={selectedMonth}
            onChange={handleMonthChange}
            className="mt-5"
          />

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por nome, categoria ou anotacao"
                className="w-full rounded-2xl border border-border bg-background py-3 pl-12 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setShowFilters((current) => !current)}
                className={`absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl ${
                  showFilters ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-income/20 bg-income/10 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Entradas
                </p>
                <p className="mt-2 text-sm font-semibold text-income">
                  {formatCurrency(summary.income)}
                </p>
              </div>
              <div className="rounded-2xl border border-expense/20 bg-expense/10 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Saidas
                </p>
                <p className="mt-2 text-sm font-semibold text-expense">
                  {formatCurrency(summary.expense)}
                </p>
              </div>
              <div
                className={`rounded-2xl border px-4 py-3 text-center ${
                  summary.balance >= 0
                    ? 'border-primary/20 bg-primary/10'
                    : 'border-expense/20 bg-expense/10'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Saldo
                </p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    summary.balance >= 0 ? 'text-primary' : 'text-expense'
                  }`}
                >
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
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
                      Ajuste o dia de virada para acompanhar seu fechamento real.
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
                <h2 className="mt-1 text-lg font-semibold">Refinar quadro</h2>
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
                        ? 'Tudo'
                        : type === 'income'
                        ? 'Receitas'
                        : 'Despesas'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Categoria
                  </label>
                  <select
                    value={filterCategoryId}
                    onChange={(event) => setFilterCategoryId(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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

        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center"
          >
            <WalletCards className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Quadro vazio</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste os filtros ou cadastre uma nova movimentacao para preencher o Kanban.
            </p>
          </motion.div>
        ) : (
          <section className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {kanbanColumns.map((column, index) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="min-h-[420px] min-w-[285px] rounded-[28px] border border-border bg-card p-4 lg:min-w-0"
              >
                <div className={`rounded-2xl border px-4 py-4 ${column.tone}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{column.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {column.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-background/70 px-3 py-1 text-sm font-medium text-foreground">
                      {column.count}
                    </span>
                  </div>
                  <p className="mt-4 text-xl font-semibold text-foreground">
                    {formatCurrency(column.total)}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {column.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                      {column.empty}
                    </div>
                  ) : (
                    column.items.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={setEditTransaction}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </section>
        )}
      </main>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openForm('expense')}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
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
        defaultType={defaultType}
      />
    </div>
  );
};

export default Transactions;
