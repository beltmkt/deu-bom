import React from 'react';
import { motion } from 'framer-motion';
import { useBudgets, useCategories, useTransactions, useFinanceStore } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import * as Icons from 'lucide-react';
import { Plus, Trash2 } from 'lucide-react';

interface BudgetCardProps {
  onAddBudget: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ onAddBudget }) => {
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const { removeBudget } = useFinanceStore();

  // Calculate spent for each budget
  const budgetsWithSpent = budgets.map((budget) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const spent = transactions
      .filter(
        (t) =>
          t.categoryId === budget.categoryId &&
          t.type === 'expense' &&
          t.status === 'completed' &&
          new Date(t.date) >= startOfMonth
      )
      .reduce((acc, t) => acc + t.amount, 0);

    const category = categories.find((c) => c.id === budget.categoryId);
    return { ...budget, spent, category };
  });

  if (budgetsWithSpent.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-dashed border-border rounded-2xl p-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Icons.PiggyBank className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Nenhum orçamento definido</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Defina limites para suas categorias de gastos
        </p>
        <button
          onClick={onAddBudget}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          Criar Orçamento
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Orçamentos do Mês</h3>
        <button
          onClick={onAddBudget}
          className="touch-btn w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
      </div>

      {budgetsWithSpent.map((budget, index) => {
        const Icon = budget.category?.icon
          ? (Icons as any)[budget.category.icon] || Icons.Circle
          : Icons.Circle;

        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
        const isOverBudget = budget.spent > budget.limit;
        const remaining = budget.limit - budget.spent;

        return (
          <motion.div
            key={budget.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: budget.category?.color + '20' }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: budget.category?.color }}
                  />
                </div>
                <div>
                  <h4 className="font-medium">{budget.category?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isOverBudget ? (
                      <span className="text-expense">
                        Excedeu {formatCurrency(Math.abs(remaining))}
                      </span>
                    ) : (
                      <span>Restam {formatCurrency(remaining)}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeBudget(budget.categoryId)}
                className="touch-btn w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-full rounded-full ${
                  isOverBudget
                    ? 'bg-expense'
                    : percentage > 80
                    ? 'bg-warning'
                    : 'bg-primary'
                }`}
              />
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span className="font-mono">{formatCurrency(budget.spent)}</span>
              <span className="text-muted-foreground font-mono">
                {formatCurrency(budget.limit)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
