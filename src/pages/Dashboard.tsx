import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarClock,
  CreditCard,
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
import { useFinanceLoading, useFinanceStore, useTransactions } from '@/stores/financeStore';
import { filterTransactionsByMonth, groupTransactionsByDate, summarizeTransactions } from '@/utils/transactionInsights';
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
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 px-4 py-4 backdrop-blur-xl">
        <div className="rounded-[28px] border border-border/60 bg-card/75 p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Inicio
              </p>
              <h1 className="text-2xl font-semibold">Painel do mes</h1>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Visao rapida do saldo, pendencias e movimentos mais recentes.
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

      <main className="space-y-6 px-4 py-6">
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
                  <p className="text-sm font-medium">Abrir central de transacoes</p>
                  <p className="text-xs text-muted-foreground">
                    explorar historico, filtros e configuracoes do ciclo
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
                <p className="text-sm font-medium">Proxima acao sugerida</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revise as pendencias e confirme as receitas antes de fechar o mes.
                </p>
              </div>
            </div>
          </motion.div>
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
                Registre uma receita ou despesa para começar o acompanhamento.
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
