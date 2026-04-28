import {
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from 'date-fns';
import type { Transaction } from '@/types/finance';

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
  completedIncome: number;
  completedExpense: number;
  completedBalance: number;
  pendingIncome: number;
  pendingExpense: number;
  pendingBalance: number;
  pendingCount: number;
}

export const getMonthInterval = (selectedMonth: Date) => ({
  start: startOfMonth(selectedMonth),
  end: endOfMonth(selectedMonth),
});

export const filterTransactionsByMonth = (
  transactions: Transaction[],
  selectedMonth: Date
) => {
  const interval = getMonthInterval(selectedMonth);

  return transactions.filter((transaction) =>
    isWithinInterval(parseISO(transaction.date), interval)
  );
};

export const sortTransactionsByDateDesc = (transactions: Transaction[]) =>
  [...transactions].sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime()
  );

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups = new Map<string, Transaction[]>();

  sortTransactionsByDateDesc(transactions).forEach((transaction) => {
    const group = groups.get(transaction.date) || [];
    group.push(transaction);
    groups.set(transaction.date, group);
  });

  return Array.from(groups.entries());
};

export const summarizeTransactions = (
  transactions: Transaction[]
): TransactionSummary => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const completedIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === 'income' && transaction.status === 'completed'
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const completedExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && transaction.status === 'completed'
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const pendingCount = transactions.filter(
    (transaction) => transaction.status === 'pending'
  ).length;

  const pendingIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === 'income' && transaction.status === 'pending'
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const pendingExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && transaction.status === 'pending'
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
    completedIncome,
    completedExpense,
    completedBalance: completedIncome - completedExpense,
    pendingIncome,
    pendingExpense,
    pendingBalance: pendingIncome - pendingExpense,
    pendingCount,
  };
};
