import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ChevronDown, BarChart3 } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomNav } from '@/components/BottomNav';
import { useTransactions, useCategories, useFinanceStore, useFinanceLoading } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';

const Analytics: React.FC = () => {
  const transactions = useTransactions();
  const categories = useCategories();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((s) => s.initialize);
  const initialized = useFinanceStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialize, initialized]);

  // Last 6 months data
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTx = transactions.filter((t) => {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });

      const income = monthTx
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
      const expense = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      months.push({
        label: format(monthDate, 'MMM', { locale: ptBR }),
        fullLabel: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
        income,
        expense,
        balance: income - expense,
      });
    }
    return months;
  }, [transactions]);

  const maxValue = useMemo(() => {
    return Math.max(
      ...monthlyData.flatMap((m) => [m.income, m.expense]),
      1
    );
  }, [monthlyData]);

  // Current month totals
  const currentMonth = monthlyData[monthlyData.length - 1];

  // Total accumulated balance
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.status !== 'completed') return acc;
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  // Top expense categories this month
  const topExpenseCategories = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const catMap: Record<string, number> = {};
    transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.status === 'completed' &&
          isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
      )
      .forEach((t) => {
        catMap[t.categoryId] = (catMap[t.categoryId] || 0) + t.amount;
      });

    return Object.entries(catMap)
      .map(([catId, amount]) => ({
        category: categories.find((c) => c.id === catId),
        amount,
      }))
      .filter((c) => c.category)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categories]);

  // Pending items
  const pendingIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const pendingExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const hasData = transactions.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 px-4 py-4 border-b border-border/50">
        <h1 className="text-2xl font-bold">Análise Financeira</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos últimos 6 meses</p>
      </header>

      <main className="px-4 py-6 space-y-6">
        {!hasData && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Nenhum dado ainda</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Adicione receitas e despesas para ver sua análise financeira.</p>
          </div>
        )}

        {hasData && <>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Saldo Total</span>
            </div>
            <p className={`text-lg font-bold font-mono ${totalBalance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(totalBalance)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-income/10 border border-income/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-income" />
              <span className="text-xs text-muted-foreground">Receita Mês</span>
            </div>
            <p className="text-lg font-bold font-mono text-income">
              {formatCurrency(currentMonth?.income || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-expense/10 border border-expense/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-expense" />
              <span className="text-xs text-muted-foreground">Despesa Mês</span>
            </div>
            <p className="text-lg font-bold font-mono text-expense">
              {formatCurrency(currentMonth?.expense || 0)}
            </p>
          </motion.div>
        </div>

        {/* Pending */}
        {(pendingIncome > 0 || pendingExpense > 0) && (
          <div className="bg-pending/10 border border-pending/20 rounded-2xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pending animate-pulse" />
              Transações Pendentes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {pendingIncome > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">A receber</p>
                  <p className="font-mono font-semibold text-income">{formatCurrency(pendingIncome)}</p>
                </div>
              )}
              {pendingExpense > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">A pagar</p>
                  <p className="font-mono font-semibold text-expense">{formatCurrency(pendingExpense)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chart - Bar chart for 6 months */}
        <section className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Receitas vs Despesas
          </h3>
          <div className="space-y-4">
            {monthlyData.map((month, i) => (
              <motion.div
                key={month.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize w-12">{month.label}</span>
                  <span className={`text-xs font-mono ${month.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                    {month.balance >= 0 ? '+' : ''}{formatCurrency(month.balance)}
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Income bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(month.income / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full rounded-full bg-income"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono w-20 text-right">
                      {formatCurrency(month.income)}
                    </span>
                  </div>
                  {/* Expense bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(month.expense / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 + 0.05 }}
                        className="h-full rounded-full bg-expense"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono w-20 text-right">
                      {formatCurrency(month.expense)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-income" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-expense" />
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
          </div>
        </section>

        {/* Monthly Balance Evolution */}
        <section className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Evolução do Saldo Mensal</h3>
          <div className="space-y-3">
            {monthlyData.map((month, i) => (
              <motion.div
                key={`balance-${month.label}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 bg-muted rounded-xl"
              >
                <span className="text-sm capitalize">{month.fullLabel}</span>
                <span className={`font-mono font-semibold ${month.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {month.balance >= 0 ? '+' : ''}{formatCurrency(month.balance)}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Expense Categories */}
        {topExpenseCategories.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Maiores Gastos do Mês</h3>
            <div className="space-y-3">
              {topExpenseCategories.map((item, i) => {
                const totalCatExpense = topExpenseCategories.reduce((a, b) => a + b.amount, 0);
                const pct = (item.amount / totalCatExpense) * 100;
                return (
                  <motion.div
                    key={item.category!.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.category!.color }}
                        />
                        <span className="text-sm">{item.category!.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-medium">{formatCurrency(item.amount)}</span>
                        <span className="text-xs text-muted-foreground ml-2">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.category!.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
        </>}
      </main>

      <BottomNav />
    </div>
  );
};

export default Analytics;
