import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BudgetCard } from '@/components/BudgetCard';
import { BudgetForm } from '@/components/BudgetForm';
import { BottomNav } from '@/components/BottomNav';
import { useTransactions, useCategories, useFinanceStore, useFinanceLoading } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Icons from 'lucide-react';

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

  // Get spending by category for current month
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const categorySpending = categories
    .filter((c) => c.type === 'expense')
    .map((category) => {
      const spent = transactions
        .filter(
          (t) =>
            t.categoryId === category.id &&
            t.type === 'expense' &&
            t.status === 'completed' &&
            isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
        )
        .reduce((acc, t) => acc + t.amount, 0);

      return { category, spent };
    })
    .filter((cs) => cs.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const totalSpent = categorySpending.reduce((acc, cs) => acc + cs.spent, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 px-4 py-4 border-b border-border/50">
        <h1 className="text-2xl font-bold">Orçamento</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Budget Cards */}
        <BudgetCard onAddBudget={() => setIsBudgetFormOpen(true)} />

        {/* Category breakdown */}
        <section>
          <h3 className="font-semibold text-lg mb-4">Gastos por Categoria</h3>

          {categorySpending.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-dashed border-border rounded-2xl p-6 text-center"
            >
              <Icons.PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Sem gastos este mês</h4>
              <p className="text-sm text-muted-foreground">
                Adicione transações para ver a distribuição
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {categorySpending.map((cs, index) => {
                const Icon = (Icons as any)[cs.category.icon] || Icons.Circle;
                const percentage = (cs.spent / totalSpent) * 100;

                return (
                  <motion.div
                    key={cs.category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: cs.category.color + '20' }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: cs.category.color }}
                          />
                        </div>
                        <span className="font-medium">{cs.category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">
                          {formatCurrency(cs.spent)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cs.category.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}

              {/* Total */}
              <div className="bg-muted rounded-xl p-4 flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="font-mono font-bold text-lg">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Budget Form Modal */}
      <BudgetForm
        isOpen={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
      />
    </div>
  );
};

export default Budgets;
