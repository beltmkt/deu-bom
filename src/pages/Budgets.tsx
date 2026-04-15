import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, PieChart, Wallet, icons } from 'lucide-react';
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { BudgetCard } from '@/components/BudgetCard';
import { BudgetForm } from '@/components/BudgetForm';
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

const Budgets: React.FC = () => {
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);

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

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const categorySpending = useMemo(() => {
    return categories
      .filter((category) => category.type === 'expense')
      .map((category) => {
        const spent = transactions
          .filter(
            (transaction) =>
              transaction.categoryId === category.id &&
              transaction.type === 'expense' &&
              transaction.status === 'completed' &&
              isWithinInterval(parseISO(transaction.date), { start: monthStart, end: monthEnd })
          )
          .reduce((total, transaction) => total + transaction.amount, 0);

        return { category, spent };
      })
      .filter((item) => item.spent > 0)
      .sort((first, second) => second.spent - first.spent);
  }, [categories, transactions, monthStart, monthEnd]);

  const totalSpent = categorySpending.reduce((total, item) => total + item.spent, 0);

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
        eyebrow="Orçamento"
        title="Controle por limite e categoria"
        description="Uma visão mais objetiva do uso do dinheiro por categoria, com foco em evitar excessos."
      >
        <p className="text-sm capitalize text-muted-foreground">
          {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </PageIntro>

      <BudgetCard onAddBudget={() => setIsBudgetFormOpen(true)} />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard>
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Distribuição
              </p>
              <h2 className="mt-1 text-lg font-semibold">Gastos por categoria</h2>
            </div>
          </div>

          {categorySpending.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title="Sem gastos neste mês"
              description="Assim que as despesas forem registradas, a distribuição por categoria aparece aqui."
              className="border-none bg-transparent px-0 py-10"
            />
          ) : (
            <div className="space-y-3">
              {categorySpending.map((item, index) => {
                const Icon =
                  icons[item.category.icon as keyof typeof icons] || Circle;
                const percentage = (item.spent / totalSpent) * 100;

                return (
                  <motion.div
                    key={item.category.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-2xl bg-muted/50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${item.category.color}20` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: item.category.color }} />
                        </div>
                        <span className="font-medium">{item.category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">{formatCurrency(item.spent)}</p>
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-background/80">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.45, delay: index * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.category.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Resumo
              </p>
              <h2 className="mt-1 text-lg font-semibold">Leitura rápida do mês</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total gasto no mês</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
            </div>

            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Categorias com movimento</p>
              <p className="mt-1 text-2xl font-semibold">{categorySpending.length}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-sm font-medium">Uso sugerido</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use esta aba para perceber rápido onde os gastos estão se concentrando e ajustar limites antes de estourar o mês.
              </p>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <BudgetForm
        isOpen={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
      />

      <BottomNav />
    </AppShell>
  );
};

export default Budgets;
