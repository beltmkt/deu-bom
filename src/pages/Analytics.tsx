import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Filter, Loader2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { PageIntro } from '@/components/PageIntro';
import { SurfaceCard } from '@/components/SurfaceCard';
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  useCategories,
  useFinanceLoading,
  useFinanceStore,
  useTransactions,
} from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import type { TransactionType } from '@/types/finance';

type RangeFilter = '6m' | '12m' | 'ytd';
type StatusFilter = 'all' | 'pending' | 'completed';

const chartConfig = {
  income: { label: 'Receitas', color: '#22c55e' },
  expense: { label: 'Despesas', color: '#ef4444' },
  balance: { label: 'Saldo', color: '#3b82f6' },
};

const Analytics: React.FC = () => {
  const transactions = useTransactions();
  const categories = useCategories();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((state) => state.initialize);
  const initialized = useFinanceStore((state) => state.initialized);

  const [range, setRange] = useState<RangeFilter>('6m');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialize, initialized]);

  const monthsToShow = range === '6m' ? 6 : range === '12m' ? 12 : new Date().getMonth() + 1;

  const monthBuckets = useMemo(() => {
    return Array.from({ length: monthsToShow }, (_, index) => {
      const monthDate = subMonths(new Date(), monthsToShow - 1 - index);
      return {
        key: format(monthDate, 'yyyy-MM'),
        label: format(monthDate, 'MMM', { locale: ptBR }),
        fullLabel: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
      };
    });
  }, [monthsToShow]);

  const filteredTransactions = useMemo(() => {
    const startDate = monthBuckets[0]?.start;
    const endDate = monthBuckets[monthBuckets.length - 1]?.end;

    return transactions.filter((transaction) => {
      const date = parseISO(transaction.date);
      if (startDate && endDate && !isWithinInterval(date, { start: startDate, end: endDate })) {
        return false;
      }
      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
      if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && transaction.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [transactions, monthBuckets, typeFilter, statusFilter, categoryFilter]);

  const monthlySeries = useMemo(() => {
    return monthBuckets.map((bucket) => {
      const monthTransactions = filteredTransactions.filter((transaction) =>
        isWithinInterval(parseISO(transaction.date), { start: bucket.start, end: bucket.end })
      );

      const income = monthTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

      const expense = monthTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

      return {
        label: bucket.label,
        fullLabel: bucket.fullLabel,
        income,
        expense,
        balance: income - expense,
      };
    });
  }, [filteredTransactions, monthBuckets]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = filteredTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  const highestExpenseMonth = useMemo(() => {
    return [...monthlySeries].sort((a, b) => b.expense - a.expense)[0];
  }, [monthlySeries]);

  const lowestExpenseMonth = useMemo(() => {
    return [...monthlySeries].sort((a, b) => a.expense - b.expense)[0];
  }, [monthlySeries]);

  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};

    filteredTransactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        map[transaction.categoryId] = (map[transaction.categoryId] || 0) + transaction.amount;
      });

    return Object.entries(map)
      .map(([categoryId, amount]) => ({
        category: categories.find((item) => item.id === categoryId),
        amount,
      }))
      .filter((item) => item.category)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTransactions, categories]);

  const pendingReal = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.status === 'pending')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Dashboard"
        title="Dados reais do seu financeiro"
        description="Painel analitico em tempo real, puxando direto do que voce registrou no sistema."
      />

      <SurfaceCard>
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Filtros do dashboard</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as RangeFilter)}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <option value="6m">Ultimos 6 meses</option>
            <option value="12m">Ultimos 12 meses</option>
            <option value="ytd">Ano atual</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as 'all' | TransactionType)}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <option value="all">Todos os status</option>
            <option value="completed">Concluidos</option>
            <option value="pending">Pendentes</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </SurfaceCard>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Sem dados para este filtro"
          description="Ajuste o periodo ou os filtros para o dashboard exibir informacoes do sistema."
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-4">
            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Receitas
                </span>
              </div>
              <p className="text-2xl font-semibold text-income">{formatCurrency(totals.income)}</p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Despesas
                </span>
              </div>
              <p className="text-2xl font-semibold text-expense">{formatCurrency(totals.expense)}</p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Saldo
                </span>
              </div>
              <p className={`text-2xl font-semibold ${totals.balance >= 0 ? 'text-primary' : 'text-expense'}`}>
                {formatCurrency(totals.balance)}
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Pendente
                </span>
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(pendingReal)}</p>
            </SurfaceCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <SurfaceCard>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Evolucao mensal
                </p>
                <h2 className="mt-1 text-lg font-semibold">Receitas e despesas por mes</h2>
              </div>

              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <BarChart data={monthlySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Saldo historico
                </p>
                <h2 className="mt-1 text-lg font-semibold">Mes a mes</h2>
              </div>

              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <LineChart data={monthlySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="balance" stroke="var(--color-balance)" strokeWidth={3} dot={false} />
                </LineChart>
              </ChartContainer>
            </SurfaceCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SurfaceCard>
              <h2 className="text-lg font-semibold">Leitura do periodo</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Mes que mais gastou</p>
                  <p className="mt-1 text-lg font-semibold">
                    {highestExpenseMonth?.fullLabel || 'Sem dados'}
                  </p>
                  <p className="mt-1 text-sm text-expense">
                    {formatCurrency(highestExpenseMonth?.expense || 0)}
                  </p>
                </div>

                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Mes que menos gastou</p>
                  <p className="mt-1 text-lg font-semibold">
                    {lowestExpenseMonth?.fullLabel || 'Sem dados'}
                  </p>
                  <p className="mt-1 text-sm text-primary">
                    {formatCurrency(lowestExpenseMonth?.expense || 0)}
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <h2 className="text-lg font-semibold">Top categorias de despesa</h2>
              <div className="mt-4 space-y-4">
                {topCategories.map((item, index) => {
                  const total = topCategories.reduce((sum, current) => sum + current.amount, 0) || 1;
                  const percentage = (item.amount / total) * 100;

                  return (
                    <motion.div
                      key={item.category!.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm">{item.category!.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatCurrency(item.amount)}
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
                    </motion.div>
                  );
                })}
              </div>
            </SurfaceCard>
          </section>
        </>
      )}

      <BottomNav />
    </AppShell>
  );
};

export default Analytics;
