import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Category, Transaction, TransactionType } from '@/types/finance';

export type AnalyticsRange = '6m' | '12m' | 'ytd';
export type AnalyticsStatusFilter = 'all' | 'pending' | 'completed';

export interface AnalyticsFilters {
  range: AnalyticsRange;
  typeFilter: 'all' | TransactionType;
  statusFilter: AnalyticsStatusFilter;
  categoryFilter: 'all' | string;
}

export interface AnalyticsMonthBucket {
  key: string;
  label: string;
  fullLabel: string;
  start: Date;
  end: Date;
}

export interface AnalyticsMonthSeries {
  label: string;
  fullLabel: string;
  income: number;
  expense: number;
  balance: number;
}

export interface AnalyticsCategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
}

export interface AnalyticsSnapshot {
  monthBuckets: AnalyticsMonthBucket[];
  filteredTransactions: Transaction[];
  monthlySeries: AnalyticsMonthSeries[];
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
  pending: {
    income: number;
    expense: number;
    net: number;
  };
  topCategories: AnalyticsCategoryBreakdown[];
  highestExpenseMonth: AnalyticsMonthSeries | null;
  lowestExpenseMonth: AnalyticsMonthSeries | null;
  completionRate: number;
  completedCount: number;
  pendingCount: number;
}

export const getMonthsToShow = (range: AnalyticsRange, referenceDate = new Date()) => {
  if (range === '6m') return 6;
  if (range === '12m') return 12;
  return referenceDate.getMonth() + 1;
};

export const buildAnalyticsSnapshot = (
  transactions: Transaction[],
  categories: Category[],
  filters: AnalyticsFilters,
  referenceDate = new Date()
): AnalyticsSnapshot => {
  const monthsToShow = getMonthsToShow(filters.range, referenceDate);

  const monthBuckets = Array.from({ length: monthsToShow }, (_, index) => {
    const monthDate = subMonths(referenceDate, monthsToShow - 1 - index);
    return {
      key: format(monthDate, 'yyyy-MM'),
      label: format(monthDate, 'MMM', { locale: ptBR }),
      fullLabel: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    };
  });

  const startDate = monthBuckets[0]?.start;
  const endDate = monthBuckets[monthBuckets.length - 1]?.end;

  const filteredTransactions = transactions.filter((transaction) => {
    const date = parseISO(transaction.date);

    if (startDate && endDate && !isWithinInterval(date, { start: startDate, end: endDate })) {
      return false;
    }

    if (filters.typeFilter !== 'all' && transaction.type !== filters.typeFilter) {
      return false;
    }

    if (filters.statusFilter !== 'all' && transaction.status !== filters.statusFilter) {
      return false;
    }

    if (filters.categoryFilter !== 'all' && transaction.categoryId !== filters.categoryFilter) {
      return false;
    }

    return true;
  });

  const monthlySeries = monthBuckets.map((bucket) => {
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

  const totals = filteredTransactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === 'income') {
        accumulator.income += transaction.amount;
      } else {
        accumulator.expense += transaction.amount;
      }

      accumulator.balance = accumulator.income - accumulator.expense;
      return accumulator;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  const pendingIncome = filteredTransactions
    .filter((transaction) => transaction.type === 'income' && transaction.status === 'pending')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const pendingExpense = filteredTransactions
    .filter((transaction) => transaction.type === 'expense' && transaction.status === 'pending')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const categoryTotals = filteredTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce<Record<string, number>>((accumulator, transaction) => {
      accumulator[transaction.categoryId] =
        (accumulator[transaction.categoryId] || 0) + transaction.amount;
      return accumulator;
    }, {});

  const categoriesTotalAmount =
    Object.values(categoryTotals).reduce((total, amount) => total + amount, 0) || 1;

  const topCategories = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => {
      const category = categories.find((item) => item.id === categoryId);
      if (!category) return null;

      return {
        category,
        amount,
        percentage: (amount / categoriesTotalAmount) * 100,
      };
    })
    .filter(Boolean)
    .sort((first, second) => second!.amount - first!.amount)
    .slice(0, 5) as AnalyticsCategoryBreakdown[];

  const monthsWithExpense = monthlySeries.filter((month) => month.expense > 0);
  const highestExpenseMonth = monthsWithExpense.length
    ? [...monthsWithExpense].sort((a, b) => b.expense - a.expense)[0]
    : null;
  const lowestExpenseMonth = monthsWithExpense.length
    ? [...monthsWithExpense].sort((a, b) => a.expense - b.expense)[0]
    : null;

  const completedCount = filteredTransactions.filter(
    (transaction) => transaction.status === 'completed'
  ).length;
  const pendingCount = filteredTransactions.filter(
    (transaction) => transaction.status === 'pending'
  ).length;
  const completionRate = filteredTransactions.length
    ? (completedCount / filteredTransactions.length) * 100
    : 0;

  return {
    monthBuckets,
    filteredTransactions,
    monthlySeries,
    totals,
    pending: {
      income: pendingIncome,
      expense: pendingExpense,
      net: pendingIncome - pendingExpense,
    },
    topCategories,
    highestExpenseMonth,
    lowestExpenseMonth,
    completionRate,
    completedCount,
    pendingCount,
  };
};
