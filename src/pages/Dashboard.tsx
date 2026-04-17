import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionForm } from '@/components/TransactionForm';
import {
  useCategories,
  useFinanceLoading,
  useFinanceStore,
  useTransactions,
} from '@/stores/financeStore';
import {
  filterTransactionsByMonth,
  sortTransactionsByDateDesc,
  summarizeTransactions,
} from '@/utils/transactionInsights';
import { formatCurrency } from '@/utils/currency';
import type { Transaction, TransactionType } from '@/types/finance';

const Dashboard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<TransactionType>('expense');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const transactions = useTransactions();
  const categories = useCategories();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((state) => state.initialize);
  const initialized = useFinanceStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  const monthlyTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const summary = useMemo(
    () => summarizeTransactions(monthlyTransactions),
    [monthlyTransactions]
  );

  const recentTransactions = useMemo(
    () => sortTransactionsByDateDesc(monthlyTransactions).slice(0, 4),
    [monthlyTransactions]
  );

  const pendingExpenses = useMemo(
    () =>
      monthlyTransactions.filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.status === 'pending'
      ),
    [monthlyTransactions]
  );

  const pendingIncome = useMemo(
    () =>
      monthlyTransactions.filter(
        (transaction) =>
          transaction.type === 'income' && transaction.status === 'pending'
      ),
    [monthlyTransactions]
  );

  const topCategory = useMemo(() => {
    const totals = monthlyTransactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.status === 'completed'
      )
      .reduce<Record<string, number>>((accumulator, transaction) => {
        accumulator[transaction.categoryId] =
          (accumulator[transaction.categoryId] || 0) + transaction.amount;
        return accumulator;
      }, {});

    const [categoryId, amount] =
      Object.entries(totals).sort((first, second) => second[1] - first[1])[0] || [];

    if (!categoryId || !amount) {
      return null;
    }

    return {
      category: categories.find((item) => item.id === categoryId),
      amount,
    };
  }, [categories, monthlyTransactions]);

  const handleAddTransaction = (type: TransactionType) => {
    setDefaultType(type);
    setEditTransaction(null);
    setIsFormOpen(true);
  };

  const handleMonthChange = (direction: number) => {
    setSelectedMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + direction, 1)
    );
  };

  const quickCards = [
    {
      label: 'Saldo livre',
      value: formatCurrency(summary.completedBalance),
      tone:
        summary.completedBalance >= 0
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'border-expense/20 bg-expense/10 text-expense',
      icon: Wallet,
    },
    {
      label: 'A pagar',
      value: formatCurrency(
        pendingExpenses.reduce((total, transaction) => total + transaction.amount, 0)
      ),
      tone: 'border-expense/20 bg-expense/10 text-expense',
      icon: TrendingDown,
    },
    {
      label: 'A receber',
      value: formatCurrency(
        pendingIncome.reduce((total, transaction) => total + transaction.amount, 0)
      ),
      tone: 'border-income/20 bg-income/10 text-income',
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Visao geral
              </p>
              <h1 className="text-2xl font-semibold">Seu financeiro em um relance</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Menos informacao solta, mais clareza para decidir o que pagar, receber e acompanhar.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAddTransaction('income')}
                className="touch-btn rounded-2xl border border-income/20 bg-income/10 px-4 py-3 text-sm font-medium text-income"
              >
                Nova receita
              </button>
              <button
                onClick={() => handleAddTransaction('expense')}
                className="touch-btn rounded-2xl border border-expense/20 bg-expense/10 px-4 py-3 text-sm font-medium text-expense"
              >
                Nova despesa
              </button>
            </div>
          </div>

          <MonthSwitcher
            selectedMonth={selectedMonth}
            onChange={handleMonthChange}
            className="mt-5"
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-3 md:grid-cols-3">
          {quickCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[24px] border p-5 ${card.tone}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{card.label}</p>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Foco do mes
                </p>
                <h2 className="mt-1 text-xl font-semibold">O que pede atencao agora</h2>
              </div>
              <Clock3 className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm font-medium">Pendencias abertas</p>
                <p className="mt-2 text-2xl font-semibold">{summary.pendingCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  lancamentos aguardando confirmacao.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm font-medium">Movimento do mes</p>
                <p className="mt-2 text-2xl font-semibold">{monthlyTransactions.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  registros usados para montar o panorama atual.
                </p>
              </div>
            </div>

            <Link
              to="/transactions"
              className="mt-5 flex items-center justify-between rounded-2xl border border-border/70 px-4 py-4 transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="text-sm font-medium">Abrir financas em Kanban</p>
                <p className="text-sm text-muted-foreground">
                  veja a fila de contas e arrume o fluxo sem poluicao visual.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[28px] border border-border bg-card p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Destaque
            </p>
            <h2 className="mt-1 text-xl font-semibold">Leitura objetiva</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Saldo projetado</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatCurrency(summary.balance)}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                <p className="text-sm font-medium">Maior peso do mes</p>
                {topCategory?.category ? (
                  <>
                    <p className="mt-2 text-lg font-semibold">
                      {topCategory.category.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(topCategory.amount)} em despesas concluidas.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Assim que houver despesas concluidas, o app destaca a categoria mais pesada.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="rounded-[28px] border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recentes
              </p>
              <h2 className="mt-1 text-xl font-semibold">Ultimos lancamentos</h2>
            </div>
            <Link to="/transactions" className="text-sm font-medium text-primary">
              Ver Kanban
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-muted/20 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Nada por aqui ainda</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Adicione a primeira receita ou despesa para o painel ganhar vida.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={setEditTransaction}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleAddTransaction('expense')}
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
        defaultType={defaultType}
      />
    </div>
  );
};

export default Dashboard;
