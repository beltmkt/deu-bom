import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarClock,
  CreditCard,
  Lightbulb,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { BalanceCard } from '@/components/BalanceCard';
import { BottomNav } from '@/components/BottomNav';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionForm } from '@/components/TransactionForm';
import { useCategories, useFinanceLoading, useFinanceStore, useTransactions } from '@/stores/financeStore';
import { filterTransactionsByMonth, groupTransactionsByDate, summarizeTransactions } from '@/utils/transactionInsights';
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

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(monthlyTransactions).slice(0, 6),
    [monthlyTransactions]
  );

  const pendingExpenses = useMemo(
    () =>
      monthlyTransactions.filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.status === 'pending'
      ).length,
    [monthlyTransactions]
  );

  const topExpenseCategory = useMemo(() => {
    const expenseTotals = monthlyTransactions
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
      Object.entries(expenseTotals).sort((first, second) => second[1] - first[1])[0] || [];

    if (!categoryId || !amount) return null;

    return {
      category: categories.find((item) => item.id === categoryId),
      amount,
    };
  }, [categories, monthlyTransactions]);

  const suggestedAction = useMemo(() => {
    if (monthlyTransactions.length === 0) {
      return 'Comece registrando a primeira despesa ou receita do mês.';
    }

    if (summary.pendingCount > 0) {
      return `Revise ${summary.pendingCount} lançamento${summary.pendingCount > 1 ? 's' : ''} pendente${summary.pendingCount > 1 ? 's' : ''} para fechar o mês com mais confiança.`;
    }

    if (summary.completedBalance < 0) {
      return 'Seu saldo confirmado está negativo. Vale revisar os maiores gastos antes da próxima semana.';
    }

    if (topExpenseCategory?.category) {
      return `Seu maior gasto confirmado até agora está em ${topExpenseCategory.category.name}.`;
    }

    return 'Seu mês está sob controle. Continue registrando as movimentações para manter a leitura confiável.';
  }, [monthlyTransactions.length, summary.completedBalance, summary.pendingCount, topExpenseCategory]);

  const formatDateHeader = (dateValue: string) => {
    const date = parseISO(dateValue);

    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanha';
    if (isYesterday(date)) return 'Ontem';

    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-border/60 bg-card/75 p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Seu mês
              </p>
              <h1 className="text-2xl font-semibold">Controle mensal sem planilha</h1>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Veja o saldo, entenda o que ainda está pendente e registre o próximo movimento sem perder tempo.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAddTransaction('income')}
                className="touch-btn h-12 rounded-2xl border border-income/25 bg-income/10 px-4 text-income"
              >
                <TrendingUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleAddTransaction('expense')}
                className="touch-btn h-12 rounded-2xl border border-expense/25 bg-expense/10 px-4 text-expense"
              >
                <TrendingDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          <MonthSwitcher
            selectedMonth={selectedMonth}
            onChange={handleMonthChange}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <BalanceCard selectedMonth={selectedMonth} />

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Entradas
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {monthlyTransactions.filter((transaction) => transaction.type === 'income').length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">receitas no periodo</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Saidas
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {monthlyTransactions.filter((transaction) => transaction.type === 'expense').length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">despesas registradas</p>
          </div>

          <div className="rounded-2xl border border-pending/20 bg-pending/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Pendentes
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.pendingCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">movimentos abertos</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Proximo foco
                </p>
                <h2 className="mt-1 text-lg font-semibold">Ritmo financeiro</h2>
              </div>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-income/15 p-2 text-income">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Recebimentos confirmados</p>
                    <p className="text-xs text-muted-foreground">
                      o que ja entrou de verdade no caixa
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm text-income">
                  {summary.completedIncome.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-expense/15 p-2 text-expense">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contas pendentes</p>
                    <p className="text-xs text-muted-foreground">
                      despesas que ainda podem mexer no saldo
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {pendingExpenses}
                </span>
              </div>

              <Link
                to="/transactions"
                className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-medium">Abrir central de transações</p>
                  <p className="text-xs text-muted-foreground">
                    explorar histórico, filtros e ajustes do ciclo financeiro
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(15,23,42,0.02))] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Leitura rapida
            </p>
            <h2 className="mt-1 text-lg font-semibold">Resumo executivo</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Saldo confirmado</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.completedBalance.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo projetado</p>
                <p className="mt-1 text-lg font-medium text-primary">
                  {summary.balance.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Próxima ação sugerida</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {suggestedAction}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Comece por aqui
            </p>
            <h2 className="mt-1 text-lg font-semibold">Ação mais útil agora</h2>
            <p className="mt-2 text-sm text-muted-foreground">{suggestedAction}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleAddTransaction('expense')}
                className="rounded-2xl border border-expense/20 bg-expense/10 px-4 py-2 text-sm font-medium text-expense"
              >
                Registrar despesa
              </button>
              <button
                onClick={() => handleAddTransaction('income')}
                className="rounded-2xl border border-income/20 bg-income/10 px-4 py-2 text-sm font-medium text-income"
              >
                Registrar receita
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Insight rápido
            </p>
            <h2 className="mt-1 text-lg font-semibold">Leitura sem esforço</h2>
            {topExpenseCategory?.category ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  A categoria com maior peso confirmado no mês é{' '}
                  <span className="font-medium text-foreground">
                    {topExpenseCategory.category.name}
                  </span>
                  .
                </p>
                <p className="mt-3 font-mono text-lg font-semibold">
                  {topExpenseCategory.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Assim que você confirmar algumas despesas, o app passa a destacar onde o mês está pesando mais.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Movimento recente
              </p>
              <h2 className="mt-1 text-lg font-semibold">Ultimos lancamentos</h2>
            </div>
            <Link
              to="/transactions"
              className="text-sm font-medium text-primary"
            >
              Ver tudo
            </Link>
          </div>

          {groupedTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Ainda sem movimentacao</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Registre a primeira receita ou despesa para o app começar a organizar seu mês e mostrar pendências, saldo e insights.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => handleAddTransaction('income')}
                  className="rounded-2xl border border-income/20 bg-income/10 px-4 py-2 font-medium text-income"
                >
                  + Receita
                </button>
                <button
                  onClick={() => handleAddTransaction('expense')}
                  className="rounded-2xl border border-expense/20 bg-expense/10 px-4 py-2 font-medium text-expense"
                >
                  + Despesa
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {groupedTransactions.map(([date, dayTransactions], index) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <h3 className="mb-3 text-sm font-medium capitalize text-muted-foreground">
                    {formatDateHeader(date)}
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
