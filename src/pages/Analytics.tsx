import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarRange,
  Filter,
  Layers3,
  Loader2,
  RotateCcw,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  useCategories,
  useFinanceLoading,
  useFinanceStore,
  useTransactions,
} from '@/stores/financeStore';
import type { TransactionType } from '@/types/finance';
import {
  buildAnalyticsSnapshot,
  type AnalyticsRange,
  type AnalyticsStatusFilter,
} from '@/utils/analytics';
import { formatCurrency } from '@/utils/currency';

const chartConfig = {
  income: { label: 'Receitas', color: '#22c55e' },
  expense: { label: 'Despesas', color: '#ef4444' },
  balance: { label: 'Saldo', color: '#3b82f6' },
};

const rangeOptions: Array<{ value: AnalyticsRange; label: string }> = [
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
  { value: 'ytd', label: 'Ano atual' },
];

const typeOptions: Array<{ value: 'all' | TransactionType; label: string }> = [
  { value: 'all', label: 'Tudo' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
];

const statusOptions: Array<{ value: AnalyticsStatusFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Concluidos' },
  { value: 'pending', label: 'Pendentes' },
];

interface FilterChipGroupProps<T extends string> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

const FilterChipGroup = <T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: FilterChipGroupProps<T>) => (
  <div className="rounded-[24px] border border-border/60 bg-background/70 p-3">
    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{label}</span>
    </div>

    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full border px-3 py-2 text-sm transition-all',
            value === option.value
              ? 'border-primary/30 bg-primary text-primary-foreground shadow-[var(--shadow-sm)]'
              : 'border-border/70 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const Analytics: React.FC = () => {
  const transactions = useTransactions();
  const categories = useCategories();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((state) => state.initialize);
  const initialized = useFinanceStore((state) => state.initialized);

  const [range, setRange] = useState<AnalyticsRange>('6m');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<AnalyticsStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialize, initialized]);

  useEffect(() => {
    if (categoryFilter === 'all') return;

    const selectedCategory = categories.find((category) => category.id === categoryFilter);
    if (!selectedCategory || (typeFilter !== 'all' && selectedCategory.type !== typeFilter)) {
      setCategoryFilter('all');
    }
  }, [categories, categoryFilter, typeFilter]);

  const categoryOptions = useMemo(() => {
    return [...categories]
      .filter((category) => typeFilter === 'all' || category.type === typeFilter)
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [categories, typeFilter]);

  const analytics = useMemo(
    () =>
      buildAnalyticsSnapshot(transactions, categories, {
        range,
        typeFilter,
        statusFilter,
        categoryFilter,
      }),
    [transactions, categories, range, typeFilter, statusFilter, categoryFilter]
  );

  const hasActiveFilters =
    range !== '6m' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all';

  const activeFilters = [
    range !== '6m' ? rangeOptions.find((option) => option.value === range)?.label : null,
    typeFilter !== 'all' ? typeOptions.find((option) => option.value === typeFilter)?.label : null,
    statusFilter !== 'all'
      ? statusOptions.find((option) => option.value === statusFilter)?.label
      : null,
    categoryFilter !== 'all'
      ? categories.find((category) => category.id === categoryFilter)?.name
      : null,
  ].filter(Boolean) as string[];

  const resetFilters = () => {
    setRange('6m');
    setTypeFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

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
        description="Painel analitico conectado ao que foi registrado no sistema, com leitura mensal e filtros mais objetivos."
        actions={
          hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
            {analytics.filteredTransactions.length} registros no recorte atual
          </span>
          <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
            {analytics.completionRate.toFixed(0)}% concluidos
          </span>
        </div>
      </PageIntro>

      <SurfaceCard className="overflow-hidden border-border/60 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--background))_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Filter className="h-4 w-4 text-primary" />
              <span>Filtros do dashboard</span>
            </div>
            <h2 className="text-xl font-semibold">Leitura limpa e ajustavel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Refine o painel por periodo, tipo, status e categoria sem perder o contexto.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFilters.length > 0 ? (
              activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  {filter}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                Sem filtros extras
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_1fr_1fr_0.9fr]">
          <FilterChipGroup
            icon={CalendarRange}
            label="Periodo"
            value={range}
            options={rangeOptions}
            onChange={setRange}
          />

          <FilterChipGroup
            icon={Layers3}
            label="Tipo"
            value={typeFilter}
            options={typeOptions}
            onChange={setTypeFilter}
          />

          <FilterChipGroup
            icon={BarChart3}
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />

          <div className="rounded-[24px] border border-border/60 bg-background/70 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span>Categoria</span>
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors hover:border-primary/20 focus:border-primary/30"
              >
                <option value="all">Todas as categorias</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {analytics.filteredTransactions.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Sem dados para este filtro"
          description="Ajuste o periodo ou os filtros para o dashboard exibir informacoes reais do sistema."
        />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-5">
            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Receitas
                </span>
              </div>
              <p className="text-2xl font-semibold text-income">
                {formatCurrency(analytics.totals.income)}
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Despesas
                </span>
              </div>
              <p className="text-2xl font-semibold text-expense">
                {formatCurrency(analytics.totals.expense)}
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Saldo
                </span>
              </div>
              <p
                className={cn(
                  'text-2xl font-semibold',
                  analytics.totals.balance >= 0 ? 'text-primary' : 'text-expense'
                )}
              >
                {formatCurrency(analytics.totals.balance)}
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  A receber
                </span>
              </div>
              <p className="text-2xl font-semibold text-primary">
                {formatCurrency(analytics.pending.income)}
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  A pagar
                </span>
              </div>
              <p className="text-2xl font-semibold text-expense">
                {formatCurrency(analytics.pending.expense)}
              </p>
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
                <BarChart data={analytics.monthlySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${Number(value) / 1000}k`}
                  />
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
                <LineChart data={analytics.monthlySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${Number(value) / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-balance)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </SurfaceCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SurfaceCard>
              <h2 className="text-lg font-semibold">Leitura do periodo</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Mes que mais gastou</p>
                  <p className="mt-1 text-lg font-semibold">
                    {analytics.highestExpenseMonth?.fullLabel || 'Sem despesas no recorte'}
                  </p>
                  <p className="mt-1 text-sm text-expense">
                    {formatCurrency(analytics.highestExpenseMonth?.expense || 0)}
                  </p>
                </div>

                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Mes que menos gastou</p>
                  <p className="mt-1 text-lg font-semibold">
                    {analytics.lowestExpenseMonth?.fullLabel || 'Sem despesas no recorte'}
                  </p>
                  <p className="mt-1 text-sm text-primary">
                    {formatCurrency(analytics.lowestExpenseMonth?.expense || 0)}
                  </p>
                </div>

                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Concluidos</p>
                  <p className="mt-1 text-lg font-semibold">{analytics.completedCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {analytics.completionRate.toFixed(0)}% do total filtrado
                  </p>
                </div>

                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="mt-1 text-lg font-semibold">{analytics.pendingCount}</p>
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      analytics.pending.net >= 0 ? 'text-primary' : 'text-expense'
                    )}
                  >
                    Impacto aberto: {formatCurrency(Math.abs(analytics.pending.net))}
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <h2 className="text-lg font-semibold">Top categorias de despesa</h2>
              <div className="mt-4 space-y-4">
                {analytics.topCategories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                    Nenhuma categoria de despesa encontrada neste recorte.
                  </div>
                ) : (
                  analytics.topCategories.map((item, index) => (
                    <motion.div
                      key={item.category.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm">{item.category.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.45, delay: index * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.category.color }}
                        />
                      </div>
                    </motion.div>
                  ))
                )}
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
