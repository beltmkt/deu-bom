import { parseISO } from 'date-fns';
import type { Transaction } from '@/types/finance';

export type TransactionSeriesScope = 'single' | 'future' | 'all';

export interface MutationCountValidation {
  ok: boolean;
  expectedIds: string[];
  affectedIds: string[];
}

export const getTransactionSeries = (
  transactions: Transaction[],
  target: Transaction
) => {
  const rootId = target.parentTransactionId || target.id;

  return transactions
    .filter((transaction) => {
      if (transaction.id === target.id) return true;
      if (target.groupId && transaction.groupId === target.groupId) return true;
      if (transaction.parentTransactionId && transaction.parentTransactionId === rootId) return true;
      if (target.parentTransactionId && transaction.id === target.parentTransactionId) return true;
      return false;
    })
    .sort((first, second) => {
      const firstOrder = first.installmentNumber ?? Number.MAX_SAFE_INTEGER;
      const secondOrder = second.installmentNumber ?? Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return parseISO(first.date).getTime() - parseISO(second.date).getTime();
    });
};

export const getScopedTransactions = (
  transactions: Transaction[],
  target: Transaction,
  scope: TransactionSeriesScope
) => {
  if (scope === 'single') {
    return [target];
  }

  const relatedTransactions = getTransactionSeries(transactions, target);

  if (scope === 'all') {
    return relatedTransactions;
  }

  const targetIndex = relatedTransactions.findIndex(
    (transaction) => transaction.id === target.id
  );

  return relatedTransactions.slice(targetIndex >= 0 ? targetIndex : 0);
};

export const getScopedTransactionIds = (
  transactions: Transaction[],
  target: Transaction,
  scope: TransactionSeriesScope
) => getScopedTransactions(transactions, target, scope).map((transaction) => transaction.id);

export const getUniqueTransactionIds = (ids: string[]) => [...new Set(ids)];

export const validateAffectedTransactionIds = (
  expectedIds: string[],
  affectedIds: string[]
): MutationCountValidation => {
  const uniqueExpectedIds = getUniqueTransactionIds(expectedIds);
  const uniqueAffectedIds = getUniqueTransactionIds(affectedIds);
  const affectedSet = new Set(uniqueAffectedIds);

  return {
    ok:
      uniqueExpectedIds.length === uniqueAffectedIds.length &&
      uniqueExpectedIds.every((id) => affectedSet.has(id)),
    expectedIds: uniqueExpectedIds,
    affectedIds: uniqueAffectedIds,
  };
};
