import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { PageIntro } from '@/components/PageIntro';
import { SurfaceCard } from '@/components/SurfaceCard';
import {
  useCategories,
  useFinanceLoading,
  useFinanceStore,
  useTransactions,
} from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';

const Analytics: React.FC = () => {
  const transactions = useTransactions();
  const categories = useCategories();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((state) => state.initialize);
  const initialized = useFinanceStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialize, initialized]);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = subMonths(new Date(), 5 - index);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter((transaction) => {
        const date = parseISO(transaction.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      const income = monthTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

      const expense = monthTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

      return {
        label: format(monthDate, 'MMM', { locale: ptBR }),
        fullLabel: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
        income,
        expense,
        balance: income - expense,
      };
    });
  }, [transactions]);

  const maxValue = useMemo(
    () => Math.max(...monthlyData.flatMap((month) => [month.income, month.expense]), 1),
    [monthlyData]
  );

  const currentMonth = monthlyData[monthlyData.length - 1];

  const totalBalance = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      if (transaction.status !== 'completed') return total;
      return transaction.type === 'income'
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
  }, [transactions]);

  const topExpenseCategories = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const categoryMap: Record<string, number> = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' &&
          transaction.status === 'completed' &&
          isWithinInterval(parseISO(transaction.date), { start: monthStart, end: monthEnd })
      )
      .forEach((transaction) => {
        categoryMap[transaction.categoryId] =
          (categoryMap[transaction.categoryId] || 0) + transaction.amount;
      });

    return Object.entries(categoryMap)
      .map(([categoryId, amount]) => ({
        category: categories.find((item) => item.id === categoryId),
        amount,
      }))
      .filter((item) => item.category)
      .sort((first, second) => second.amount - first.amount)
      .slice(0, 5);
  }, [transactions, categories]);

  const pendingIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'income' && transaction.status === 'pending')
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions]
  );

  const pendingExpense = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'expense' && transaction.status === 'pending')
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Análise"
        title="Tendências e leitura histórica"
        description="Veja a evolução do seu dinheiro e entenda rapidamente onde o mês está apertando ou sobrando."
      />

      {transactions.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Ainda não há dados para analisar"
          description="Assim que receitas e despesas forem registradas, esta aba passa a mostrar evolução, categorias e tendências."
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Saldo total
                </span>
              </div>
              <p className={`text-2xl font-semibold ${totalBalance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </SurfaceCard>

            <SurfaceCard className="bg-income/10">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Receita do mês
                </span>
              </div>
              <p className="text-2xl font-semibold text-income">
                {formatCurrency(currentMonth?.income || 0)}
              </p>
            </SurfaceCard>

            <SurfaceCard className="bg-expense/10">
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Despesa do mês
                </span>
              </div>
              <p className="text-2xl font-semibold text-expense">
                {formatCurrency(currentMonth?.expense || 0)}
              </p>
            </SurfaceCard>
          </section>

          <SurfaceCard>
            <h2 className="text-lg font-semibold">O que merece atenção</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {pendingExpense > 0
                ? `Você ainda tem ${formatCurrency(pendingExpense)} em despesas pendentes. Confirmar esses valores deixa o saldo do mês mais confiável.`
                : topExpenseCategories[0]
                ? `Seu maior gasto confirmado no mês está em ${topExpenseCategories[0].category!.name}. Vale acompanhar essa categoria mais de perto.`
                : 'Assim que houver mais lançamentos, esta área começa a destacar padrões e possíveis excessos automaticamente.'}
            </p>
          </SurfaceCard>

          {(pendingIncome > 0 || pendingExpense > 0) && (
            <SurfaceCard className="bg-pending/10">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pending" />
                <h2 className="text-lg font-semibold">Pendências abertas</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingIncome > 0 ? (
                  <div>
                    <p className="text-sm text-muted-foreground">A receber</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-income">
                      {formatCurrency(pendingIncome)}
                    </p>
                  </div>
                ) : null}
                {pendingExpense > 0 ? (
                  <div>
                    <p className="text-sm text-muted-foreground">A pagar</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-expense">
                      {formatCurrency(pendingExpense)}
                    </p>
                  </div>
                ) : null}
              </div>
            </SurfaceCard>
          )}

          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <SurfaceCard>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Histórico recente
                </p>
                <h2 className="mt-1 text-lg font-semibold">Receitas vs despesas</h2>
              </div>
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <motion.div
                    key={month.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="w-12 text-sm font-medium capitalize">{month.label}</span>
                      <span
                        className={`text-xs font-mono ${
                          month.balance >= 0 ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {month.balance >= 0 ? '+' : ''}
                        {formatCurrency(month.balance)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(month.income / maxValue) * 100}%` }}
                            transition={{ duration: 0.45, delay: index * 0.05 }}
                            className="h-full rounded-full bg-income"
                          />
                        </div>
                        <span className="w-20 text-right text-xs font-mono text-muted-foreground">
                          {formatCurrency(month.income)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(month.expense / maxValue) * 100}%` }}
                            transition={{ duration: 0.45, delay: index * 0.05 + 0.04 }}
                            className="h-full rounded-full bg-expense"
                          />
                        </div>
                        <span className="w-20 text-right text-xs font-mono text-muted-foreground">
                          {formatCurrency(month.expense)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SurfaceCard>

            <div className="grid gap-4">
              <SurfaceCard>
                <h2 className="text-lg font-semibold">Evolução mensal</h2>
                <div className="mt-4 space-y-3">
                  {monthlyData.map((month, index) => (
                    <motion.div
                      key={month.fullLabel}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3"
                    >
                      <span className="text-sm capitalize">{month.fullLabel}</span>
                      <span
                        className={`font-mono text-sm font-semibold ${
                          month.balance >= 0 ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {month.balance >= 0 ? '+' : ''}
                        {formatCurrency(month.balance)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </SurfaceCard>

              {topExpenseCategories.length > 0 ? (
                <SurfaceCard>
                  <h2 className="text-lg font-semibold">Maiores gastos do mês</h2>
                  <div className="mt-4 space-y-4">
                    {topExpenseCategories.map((item, index) => {
                      const total = topExpenseCategories.reduce(
                        (sum, current) => sum + current.amount,
                        0
                      );
                      const percentage = (item.amount / total) * 100;

                      return (
                        <motion.div
                          key={item.category!.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.category!.color }}
                              />
                              <span className="text-sm">{item.category!.name}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.45, delay: index * 0.05 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: item.category!.color }}
                            />
                          </div>
                          <p className="mt-2 text-right text-sm font-mono">
                            {formatCurrency(item.amount)}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </SurfaceCard>
              ) : null}
            </div>
          </section>
        </>
      )}

      <BottomNav />
    </AppShell>
  );
};

export default Analytics;
