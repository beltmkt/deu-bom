import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CalendarPlus,
  Check,
  ChevronDown,
  Circle,
  Clock,
  Sparkles,
  X,
  icons,
} from 'lucide-react';
import { addMonths, addWeeks, addYears, format, parseISO } from 'date-fns';
import { useCategories, useFinanceStore, useTransactions } from '@/stores/financeStore';
import { CurrencyInput } from './CurrencyInput';
import { openGoogleCalendar } from '@/utils/googleCalendar';
import { toast } from 'sonner';
import type {
  RecurrenceInterval,
  RecurrenceType,
  Transaction,
  TransactionType,
} from '@/types/finance';
import { TransactionUpdateModal } from '@/components/TransactionDeleteModal';

type EndConditionType = 'never' | 'date' | 'occurrences';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  defaultType?: TransactionType;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  editTransaction,
  defaultType = 'expense',
}) => {
  const categories = useCategories();
  const transactions = useTransactions();
  const { addTransaction, updateTransaction, generateRecurringTransactions } = useFinanceStore();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceInterval, setRecurrenceInterval] =
    useState<RecurrenceInterval>('monthly');
  const [endCondition, setEndCondition] = useState<EndConditionType>('occurrences');
  const [occurrences, setOccurrences] = useState(12);
  const [endDate, setEndDate] = useState(
    format(addMonths(new Date(), 12), 'yyyy-MM-dd')
  );
  const [installments, setInstallments] = useState(2);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(true);
  const [showUpdateScopeModal, setShowUpdateScopeModal] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] =
    useState<Record<string, unknown> | null>(null);
  const [pendingUpdateTransactionId, setPendingUpdateTransactionId] = useState<string | null>(null);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingScope, setIsResolvingScope] = useState(false);

  const filteredCategories = categories.filter((category) => category.type === type);
  const selectedCategory = categories.find((category) => category.id === categoryId);

  const resetForm = useCallback(() => {
    setType(defaultType);
    setTitle('');
    setAmount(0);
    setCategoryId('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setStatus('pending');
    setRecurrenceType('none');
    setInstallments(2);
    setRecurrenceInterval('monthly');
    setEndCondition('occurrences');
    setOccurrences(12);
    setEndDate(format(addMonths(new Date(), 12), 'yyyy-MM-dd'));
    setShowCategoryPicker(false);
    setShowAdvancedFields(true);
    setShowUpdateScopeModal(false);
    setPendingUpdateData(null);
    setPendingUpdateTransactionId(null);
    setSuggestedCategoryId(null);
    setIsSubmitting(false);
    setIsResolvingScope(false);
  }, [defaultType]);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setTitle(editTransaction.title);
      setAmount(editTransaction.amount);
      
      setCategoryId(editTransaction.categoryId);
      setDate(editTransaction.date);
      setNotes(editTransaction.notes || '');
      setStatus(editTransaction.status);
      setRecurrenceType(editTransaction.recurrenceType);
      if (editTransaction.recurrenceInterval) {
        setRecurrenceInterval(editTransaction.recurrenceInterval);
      }
      setShowAdvancedFields(
        editTransaction.recurrenceType !== 'none' || Boolean(editTransaction.notes)
      );
      setSuggestedCategoryId(null);
      setShowCategoryPicker(false);
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen, resetForm]);

  useEffect(() => {
    if (!editTransaction && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [categoryId, editTransaction, filteredCategories]);

  useEffect(() => {
    if (editTransaction || !title.trim()) {
      setSuggestedCategoryId(null);
      return;
    }

    const normalizedTitle = title.trim().toLowerCase();

    const categoryNameMatch = filteredCategories.find((category) =>
      normalizedTitle.includes(category.name.toLowerCase())
    );

    if (categoryNameMatch) {
      setSuggestedCategoryId(categoryNameMatch.id);
      return;
    }

    const recentMatch = [...transactions]
      .filter((transaction) => transaction.type === type)
      .sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
      )
      .find((transaction) => {
        const transactionTitle = transaction.title.trim().toLowerCase();
        return (
          transactionTitle === normalizedTitle ||
          transactionTitle.includes(normalizedTitle) ||
          normalizedTitle.includes(transactionTitle)
        );
      });

    setSuggestedCategoryId(recentMatch?.categoryId || null);
  }, [editTransaction, filteredCategories, title, transactions, type]);

  const calculateOccurrencesFromDate = (): number => {
    const start = parseISO(date);
    const end = parseISO(endDate);
    let count = 0;
    let current = start;

    while (current <= end) {
      count += 1;
      if (recurrenceInterval === 'weekly') {
        current = addWeeks(current, 1);
      } else if (recurrenceInterval === 'monthly') {
        current = addMonths(current, 1);
      } else {
        current = addYears(current, 1);
      }
    }

    return Math.max(1, count);
  };

  const isRecurringEdit = Boolean(
    editTransaction &&
      (editTransaction.groupId ||
        editTransaction.parentTransactionId ||
        (editTransaction.totalInstallments && editTransaction.totalInstallments > 1))
  );

  const handleSubmit = async (updateFuture = false, updateAll = false) => {
    if (!title || !amount || !categoryId || isSubmitting || isResolvingScope) return;

    const transactionData = {
      title,
      amount,
      type,
      status: editTransaction
        ? status
        : ((type === 'expense' ? 'completed' : 'pending') as const),
      categoryId,
      date,
      notes,
      notify: false,
      recurrenceType,
      recurrenceInterval: recurrenceType === 'subscription' ? recurrenceInterval : undefined,
    };

    if (editTransaction) {
      if (isRecurringEdit && !showUpdateScopeModal && !updateFuture && !updateAll) {
        setPendingUpdateData(transactionData);
        setPendingUpdateTransactionId(editTransaction.id);
        setShowUpdateScopeModal(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const success = await updateTransaction(
          editTransaction.id,
          transactionData,
          updateFuture,
          updateAll
        );
        if (!success) return;

        toast.success('Transacao atualizada e sincronizada!');
        onClose();
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (recurrenceType === 'installment' && installments > 1) {
      setIsSubmitting(true);
      try {
        const success = await generateRecurringTransactions(
          transactionData,
          installments,
          'monthly',
          true
        );
        if (!success) return;

        toast.success(`${installments} parcelas criadas!`);
        onClose();
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (recurrenceType === 'subscription') {
      let count: number;

      if (endCondition === 'never') {
        count = 24;
      } else if (endCondition === 'date') {
        count = calculateOccurrencesFromDate();
      } else {
        count = occurrences;
      }

      setIsSubmitting(true);
      try {
        const success = await generateRecurringTransactions(
          transactionData,
          count,
          recurrenceInterval,
          false
        );
        if (!success) return;

        toast.success(`${count} transacoes recorrentes criadas!`);
        onClose();
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addTransaction(transactionData);
      if (!success) return;

      toast.success('Transacao adicionada!');
      onClose();
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateScopeConfirm = async (scope: 'single' | 'future' | 'all') => {
    if (!pendingUpdateTransactionId || !pendingUpdateData || isResolvingScope) return;

    setIsResolvingScope(true);
    try {
      const success =
        scope === 'single'
          ? await updateTransaction(
              pendingUpdateTransactionId,
              pendingUpdateData as Partial<Transaction>,
              false
            )
          : scope === 'future'
            ? await updateTransaction(
                pendingUpdateTransactionId,
                pendingUpdateData as Partial<Transaction>,
                true
              )
            : await updateTransaction(
                pendingUpdateTransactionId,
                pendingUpdateData as Partial<Transaction>,
                false,
                true
              );

      if (!success) return;

      const scopeLabel =
        scope === 'single'
          ? 'este lancamento'
          : scope === 'future'
            ? 'este e os proximos lancamentos'
            : 'toda a serie';

      toast.success(`Atualizacao aplicada em ${scopeLabel}.`);
      setShowUpdateScopeModal(false);
      setPendingUpdateData(null);
      setPendingUpdateTransactionId(null);
      onClose();
      resetForm();
    } finally {
      setIsResolvingScope(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isResolvingScope) return;
    onClose();
    resetForm();
  };

  const canOpenCalendar = Boolean(title.trim() && amount > 0 && date);

  const handleAddToCalendar = () => {
    if (!canOpenCalendar) return;

    openGoogleCalendar({
      title: title.trim(),
      date,
      amount,
      type,
      notes: notes.trim() || undefined,
    });

    toast.success('Abrindo Google Agenda...');
  };

  const applySuggestedCategory = () => {
    if (!suggestedCategoryId) return;
    setCategoryId(suggestedCategoryId);
  };

  const CategoryIcon =
    (selectedCategory?.icon
      ? icons[selectedCategory.icon as keyof typeof icons]
      : undefined) || Circle;

  const suggestedCategory = suggestedCategoryId
    ? categories.find((category) => category.id === suggestedCategoryId)
    : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-card sm:static sm:max-h-[86vh] sm:w-[min(42rem,calc(100vw-1.5rem))] sm:rounded-3xl"
        >
          <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold sm:text-lg">
              {editTransaction ? 'Editar transacao' : 'Nova transacao'}
            </h2>
            <button
              onClick={handleClose}
              className="touch-btn flex h-9 w-9 items-center justify-center rounded-full bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-5">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              <button
                onClick={() => setType('expense')}
                className={`py-3 rounded-lg font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-expense text-expense-foreground shadow-md'
                    : 'text-muted-foreground'
                }`}
              >
                Despesa
              </button>
              <button
                onClick={() => setType('income')}
                className={`py-3 rounded-lg font-medium transition-all ${
                  type === 'income'
                    ? 'bg-income text-income-foreground shadow-md'
                    : 'text-muted-foreground'
                }`}
              >
                Receita
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Valor
              </label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                className={type === 'income' ? 'focus:ring-income' : 'focus:ring-expense'}
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Descricao
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Supermercado"
                className="w-full rounded-xl border border-border bg-input px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {!editTransaction && suggestedCategory && suggestedCategory.id !== categoryId ? (
                <button
                  type="button"
                  onClick={applySuggestedCategory}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Sugerir categoria: {suggestedCategory.name}
                </button>
              ) : null}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Categoria
              </label>
              <button
                onClick={() => setShowCategoryPicker((current) => !current)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-input px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${selectedCategory?.color || '#64748b'}20` }}
                  >
                    <CategoryIcon
                      className="h-5 w-5"
                      style={{ color: selectedCategory?.color }}
                    />
                  </div>
                  <span>{selectedCategory?.name || 'Selecionar'}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    showCategoryPicker ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showCategoryPicker ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-muted p-3">
                      {filteredCategories.map((category) => {
                        const Icon =
                          icons[category.icon as keyof typeof icons] || Circle;

                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              setCategoryId(category.id);
                              setShowCategoryPicker(false);
                            }}
                            className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                              categoryId === category.id
                                ? 'bg-card shadow-md'
                                : 'hover:bg-card/50'
                            }`}
                          >
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: category.color }} />
                            </div>
                            <span className="w-full truncate text-center text-xs">
                              {category.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {recurrenceType === 'none' ? 'Data' : 'Data de inicio'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mb-6 rounded-[20px] border border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setShowAdvancedFields((current) => !current)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
              >
                <div>
                  <p className="text-sm font-medium">Recorrencia e parcelas</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use recorrente para salario mensal e parcelado para dividas em varias vezes.
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    showAdvancedFields ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showAdvancedFields ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border/70"
                  >
                    <div className="px-4 pb-4 pt-3.5">
                      {!editTransaction ? (
                        <div className="mb-6">
                          <label className="mb-2 block text-sm font-medium text-muted-foreground">
                            Como esse lancamento se repete?
                          </label>
                          <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
                            <button
                              type="button"
                              onClick={() => setRecurrenceType('none')}
                              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                                recurrenceType === 'none'
                                  ? 'bg-card text-foreground shadow-md'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              Unica
                            </button>
                            <button
                              type="button"
                              onClick={() => setRecurrenceType('installment')}
                              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                                recurrenceType === 'installment'
                                  ? 'bg-card text-foreground shadow-md'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              Parcelado
                            </button>
                            <button
                              type="button"
                              onClick={() => setRecurrenceType('subscription')}
                              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                                recurrenceType === 'subscription'
                                  ? 'bg-card text-foreground shadow-md'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              Recorrente
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setType('income');
                                setRecurrenceType('subscription');
                                setRecurrenceInterval('monthly');
                                setEndCondition('never');
                              }}
                              className="rounded-xl border border-income/20 bg-income/10 px-3 py-2 text-left text-xs font-medium text-income"
                            >
                              Salario mensal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setType('expense');
                                setRecurrenceType('installment');
                              }}
                              className="rounded-xl border border-expense/20 bg-expense/10 px-3 py-2 text-left text-xs font-medium text-expense"
                            >
                              Divida parcelada
                            </button>
                          </div>

                          {recurrenceType === 'installment' ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-4"
                            >
                              <label className="mb-2 block text-sm text-muted-foreground">
                                Numero de parcelas
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="2"
                                  max="48"
                                  value={installments}
                                  onChange={(event) =>
                                    setInstallments(Number.parseInt(event.target.value, 10))
                                  }
                                  className="flex-1"
                                />
                                <span className="w-12 text-center font-mono text-lg font-semibold">
                                  {installments}x
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Valor por parcela:{' '}
                                <span className="font-mono font-medium text-foreground">
                                  R${' '}
                                  {(amount / installments).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </p>
                            </motion.div>
                          ) : null}

                          {recurrenceType === 'subscription' ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-4 space-y-4"
                            >
                              <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                  Repetir a cada
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['weekly', 'monthly', 'yearly'] as RecurrenceInterval[]).map(
                                    (interval) => (
                                      <button
                                        key={interval}
                                        onClick={() => setRecurrenceInterval(interval)}
                                        className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                                          recurrenceInterval === interval
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-muted text-muted-foreground'
                                        }`}
                                      >
                                        {interval === 'weekly' && 'Semana'}
                                        {interval === 'monthly' && 'Mes'}
                                        {interval === 'yearly' && 'Ano'}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                  Termina
                                </label>
                                <div className="mb-3 grid grid-cols-3 gap-2">
                                  <button
                                    onClick={() => setEndCondition('never')}
                                    className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                                      endCondition === 'never'
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    Nunca
                                  </button>
                                  <button
                                    onClick={() => setEndCondition('occurrences')}
                                    className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                                      endCondition === 'occurrences'
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    Apos X vezes
                                  </button>
                                  <button
                                    onClick={() => setEndCondition('date')}
                                    className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                                      endCondition === 'date'
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    Em data
                                  </button>
                                </div>

                                {endCondition === 'occurrences' ? (
                                  <div className="flex items-center gap-4">
                                    <input
                                      type="range"
                                      min="2"
                                      max="60"
                                      value={occurrences}
                                      onChange={(event) =>
                                        setOccurrences(Number.parseInt(event.target.value, 10))
                                      }
                                      className="flex-1"
                                    />
                                    <span className="w-16 text-center font-mono text-lg font-semibold">
                                      {occurrences}x
                                    </span>
                                  </div>
                                ) : null}

                                {endCondition === 'date' ? (
                                  <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                      type="date"
                                      value={endDate}
                                      onChange={(event) => setEndDate(event.target.value)}
                                      className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </motion.div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-muted-foreground">
                          Observacoes (opcional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Adicione uma nota..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-border bg-input px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {editTransaction ? (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                  <button
                    onClick={() => setStatus('pending')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 font-medium transition-all ${
                      status === 'pending'
                        ? 'border border-pending/30 bg-pending/20 text-pending shadow-md'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Pendente
                  </button>
                  <button
                    onClick={() => setStatus('completed')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 font-medium transition-all ${
                      status === 'completed'
                        ? 'border border-income/30 bg-income/20 text-income shadow-md'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    Confirmado
                  </button>
                </div>
              </div>
            ) : null}

            {editTransaction &&
            editTransaction.installmentNumber &&
            editTransaction.totalInstallments ? (
              <div className="mb-6 rounded-xl border border-border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Parcela</span>
                  <span className="text-sm font-semibold">
                    {editTransaction.installmentNumber} de{' '}
                    {editTransaction.totalInstallments}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-border bg-card p-4 sm:p-5">
            <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
              <button
                type="button"
                onClick={handleAddToCalendar}
                disabled={!canOpenCalendar || isSubmitting || isResolvingScope}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CalendarPlus className="h-4 w-4" />
                Adicionar ao Google
              </button>

              <button
                onClick={() => handleSubmit()}
                disabled={!title || !amount || !categoryId || isSubmitting || isResolvingScope}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  type === 'income'
                    ? 'bg-income text-income-foreground shadow-glow-income'
                    : 'bg-expense text-expense-foreground shadow-glow-expense'
                }`}
              >
                {isSubmitting
                  ? 'Salvando...'
                  : editTransaction
                    ? 'Salvar alteracoes'
                    : 'Salvar'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <TransactionUpdateModal
        isOpen={showUpdateScopeModal}
        onClose={() => {
          if (isResolvingScope) return;
          setShowUpdateScopeModal(false);
          setPendingUpdateData(null);
          setPendingUpdateTransactionId(null);
        }}
        onConfirm={handleUpdateScopeConfirm}
        transactionTitle={editTransaction?.title || ''}
        isSubmitting={isResolvingScope}
      />
    </AnimatePresence>
  );
};
