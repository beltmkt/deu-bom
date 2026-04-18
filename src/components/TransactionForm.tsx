import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  ChevronDown,
  Sparkles,
  CalendarPlus,
  Download,
  Check,
  Circle,
  Clock,
  icons,
} from 'lucide-react';
import { format, addMonths, addWeeks, addYears, parseISO } from 'date-fns';
import { useFinanceStore, useCategories, useTransactions } from '@/stores/financeStore';
import { CurrencyInput } from './CurrencyInput';
import { openGoogleCalendar } from '@/utils/googleCalendar';
import { downloadCalendarFile } from '@/utils/calendarFile';
import { toast } from 'sonner';
import type { Transaction, TransactionType, RecurrenceType, RecurrenceInterval } from '@/types/finance';
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
  
  // Recurrence settings
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('monthly');
  const [endCondition, setEndCondition] = useState<EndConditionType>('occurrences');
  const [occurrences, setOccurrences] = useState(12);
  const [endDate, setEndDate] = useState(format(addMonths(new Date(), 12), 'yyyy-MM-dd'));
  
  // For installments
  const [installments, setInstallments] = useState(2);
  
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showUpdateScopeModal, setShowUpdateScopeModal] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState<Record<string, unknown> | null>(null);
  const [showSuccessActions, setShowSuccessActions] = useState(false);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<{
    title: string;
    date: string;
    amount: number;
    type: TransactionType;
    notes?: string;
  } | null>(null);

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);

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
    setShowAdvancedFields(false);
    setSuggestedCategoryId(null);
    setShowSuccessActions(false);
    setLastSavedTransaction(null);
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
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen, resetForm]);

  useEffect(() => {
    if (!editTransaction && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, categoryId, editTransaction]);

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
      count++;
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

  const isRecurringEdit = !!(editTransaction && (editTransaction.groupId || editTransaction.parentTransactionId || (editTransaction.totalInstallments && editTransaction.totalInstallments > 1)));

  const handleSubmit = async (updateFuture = false, updateAll = false) => {
    if (!title || !amount || !categoryId) return;

    const transactionData = {
      title,
      amount,
      type,
      status: editTransaction ? status : (type === 'expense' ? 'completed' as const : 'pending' as const),
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
        setShowUpdateScopeModal(true);
        return;
      }
      await updateTransaction(editTransaction.id, transactionData, updateFuture, updateAll);
      toast.success('Transação atualizada!');
      onClose();
      resetForm();
    } else if (recurrenceType === 'installment' && installments > 1) {
      await generateRecurringTransactions(transactionData, installments, 'monthly', true);
      toast.success(`${installments} parcelas criadas!`);
      setLastSavedTransaction(transactionData);
      setShowSuccessActions(true);
    } else if (recurrenceType === 'subscription') {
      let count: number;
      if (endCondition === 'never') {
        count = 24;
      } else if (endCondition === 'date') {
        count = calculateOccurrencesFromDate();
      } else {
        count = occurrences;
      }
      
      await generateRecurringTransactions(transactionData, count, recurrenceInterval, false);
      toast.success(`${count} transações recorrentes criadas!`);
      setLastSavedTransaction(transactionData);
      setShowSuccessActions(true);
    } else {
      await addTransaction(transactionData);
      toast.success('Transação adicionada!');
      setLastSavedTransaction(transactionData);
      setShowSuccessActions(true);
    }
  };

  const handleUpdateScopeConfirm = async (scope: 'single' | 'future' | 'all') => {
    setShowUpdateScopeModal(false);
    if (!editTransaction || !pendingUpdateData) return;
    
    if (scope === 'single') {
      await updateTransaction(editTransaction.id, pendingUpdateData as Partial<Transaction>, false);
    } else if (scope === 'future') {
      await updateTransaction(editTransaction.id, pendingUpdateData as Partial<Transaction>, true);
    } else {
      await updateTransaction(
        editTransaction.id,
        pendingUpdateData as Partial<Transaction>,
        false,
        true
      );
    }
    toast.success('Transação atualizada!');
    setPendingUpdateData(null);
    onClose();
    resetForm();
  };

  const handleAddToCalendar = () => {
    if (lastSavedTransaction) {
      openGoogleCalendar(lastSavedTransaction);
      toast.success('Abrindo Google Calendar...');
    }
  };

  const handleDownloadCalendarFile = () => {
    if (lastSavedTransaction) {
      downloadCalendarFile(lastSavedTransaction);
      toast.success('Arquivo .ics baixado!');
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
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

  // Success state with calendar action
  if (showSuccessActions && lastSavedTransaction) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={handleClose}
        >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl bg-card sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(28rem,calc(100vw-1.5rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        >
          <div className="p-5 text-center sm:p-6">
              <div className="w-16 h-16 rounded-full bg-income/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-income" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Transação Salva!</h2>
              <p className="text-muted-foreground mb-6">
                {lastSavedTransaction.title} foi adicionada com sucesso.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddToCalendar}
                  className="w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Adicionar ao Google Calendar
                </button>
                <button
                  onClick={handleDownloadCalendarFile}
                  className="w-full py-4 rounded-xl font-semibold bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Baixar arquivo .ics (Outlook/Apple)
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-4 rounded-xl font-semibold bg-muted text-foreground"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-card sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[86vh] sm:w-[min(42rem,calc(100vw-1.5rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold sm:text-lg">
              {editTransaction ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <button
              onClick={handleClose}
              className="touch-btn flex h-9 w-9 items-center justify-center rounded-full bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-5 sm:pb-24">
            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-6">
              <button
                onClick={() => setType('expense')}
                className={`
                  py-3 rounded-lg font-medium transition-all
                  ${type === 'expense'
                    ? 'bg-expense text-expense-foreground shadow-md'
                    : 'text-muted-foreground'
                  }
                `}
              >
                Despesa
              </button>
              <button
                onClick={() => setType('income')}
                className={`
                  py-3 rounded-lg font-medium transition-all
                  ${type === 'income'
                    ? 'bg-income text-income-foreground shadow-md'
                    : 'text-muted-foreground'
                  }
                `}
              >
                Receita
              </button>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Valor
              </label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                className={type === 'income' ? 'focus:ring-income' : 'focus:ring-expense'}
              />
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Supermercado"
                className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Categoria
              </label>
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="w-full px-4 py-4 rounded-xl bg-input border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: selectedCategory?.color + '20' }}
                  >
                    <CategoryIcon
                      className="w-5 h-5"
                      style={{ color: selectedCategory?.color }}
                    />
                  </div>
                  <span>{selectedCategory?.name || 'Selecionar'}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCategoryPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-2 mt-3 p-3 bg-muted rounded-xl">
                      {filteredCategories.map((cat) => {
                        const Icon = icons[cat.icon as keyof typeof icons] || Circle;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setCategoryId(cat.id);
                              setShowCategoryPicker(false);
                            }}
                            className={`
                              flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                              ${categoryId === cat.id
                                ? 'bg-card shadow-md'
                                : 'hover:bg-card/50'
                              }
                            `}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: cat.color + '20' }}
                            >
                              <Icon className="w-5 h-5" style={{ color: cat.color }} />
                            </div>
                            <span className="text-xs text-center truncate w-full">
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {recurrenceType === 'none' ? 'Data' : 'Data de início'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <p className="text-sm font-medium">Mais opções</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Parcelamento, recorrência e observações ficam aqui para o fluxo principal continuar simples.
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
                      {!editTransaction && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Tipo de transação
                          </label>
                          <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl">
                            <button
                              onClick={() => setRecurrenceType('none')}
                              className={`
                                py-3 rounded-lg text-sm font-medium transition-all
                                ${recurrenceType === 'none'
                                  ? 'bg-card shadow-md text-foreground'
                                  : 'text-muted-foreground'
                                }
                              `}
                            >
                              Única
                            </button>
                            <button
                              onClick={() => setRecurrenceType('installment')}
                              className={`
                                py-3 rounded-lg text-sm font-medium transition-all
                                ${recurrenceType === 'installment'
                                  ? 'bg-card shadow-md text-foreground'
                                  : 'text-muted-foreground'
                                }
                              `}
                            >
                              Parcelado
                            </button>
                            <button
                              onClick={() => setRecurrenceType('subscription')}
                              className={`
                                py-3 rounded-lg text-sm font-medium transition-all
                                ${recurrenceType === 'subscription'
                                  ? 'bg-card shadow-md text-foreground'
                                  : 'text-muted-foreground'
                                }
                              `}
                            >
                              Recorrente
                            </button>
                          </div>

                          {recurrenceType === 'installment' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-4"
                            >
                              <label className="block text-sm text-muted-foreground mb-2">
                                Número de parcelas
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="2"
                                  max="48"
                                  value={installments}
                                  onChange={(e) => setInstallments(parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="font-mono text-lg font-semibold w-12 text-center">
                                  {installments}x
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Valor por parcela:{' '}
                                <span className="font-mono font-medium text-foreground">
                                  R$ {(amount / installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </p>
                            </motion.div>
                          )}

                          {recurrenceType === 'subscription' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-4 space-y-4"
                            >
                              <div>
                                <label className="block text-sm text-muted-foreground mb-2">
                                  Repetir a cada
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['weekly', 'monthly', 'yearly'] as RecurrenceInterval[]).map((interval) => (
                                    <button
                                      key={interval}
                                      onClick={() => setRecurrenceInterval(interval)}
                                      className={`
                                        py-3 rounded-xl text-sm font-medium transition-all border
                                        ${recurrenceInterval === interval
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : 'bg-muted border-border text-muted-foreground'
                                        }
                                      `}
                                    >
                                      {interval === 'weekly' && 'Semana'}
                                      {interval === 'monthly' && 'Mês'}
                                      {interval === 'yearly' && 'Ano'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm text-muted-foreground mb-2">
                                  Termina
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                  <button
                                    onClick={() => setEndCondition('never')}
                                    className={`
                                      py-3 rounded-xl text-sm font-medium transition-all border
                                      ${endCondition === 'never'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted border-border text-muted-foreground'
                                      }
                                    `}
                                  >
                                    Nunca
                                  </button>
                                  <button
                                    onClick={() => setEndCondition('occurrences')}
                                    className={`
                                      py-3 rounded-xl text-sm font-medium transition-all border
                                      ${endCondition === 'occurrences'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted border-border text-muted-foreground'
                                      }
                                    `}
                                  >
                                    Após X vezes
                                  </button>
                                  <button
                                    onClick={() => setEndCondition('date')}
                                    className={`
                                      py-3 rounded-xl text-sm font-medium transition-all border
                                      ${endCondition === 'date'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted border-border text-muted-foreground'
                                      }
                                    `}
                                  >
                                    Em data
                                  </button>
                                </div>

                                {endCondition === 'occurrences' && (
                                  <div className="flex items-center gap-4">
                                    <input
                                      type="range"
                                      min="2"
                                      max="60"
                                      value={occurrences}
                                      onChange={(e) => setOccurrences(parseInt(e.target.value))}
                                      className="flex-1"
                                    />
                                    <span className="font-mono text-lg font-semibold w-16 text-center">
                                      {occurrences}x
                                    </span>
                                  </div>
                                )}

                                {endCondition === 'date' && (
                                  <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                      type="date"
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Observações (opcional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Adicione uma nota..."
                          rows={3}
                          className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>


            {/* Status toggle (edit mode) */}
            {editTransaction && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                  <button
                    onClick={() => setStatus('pending')}
                    className={`
                      py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                      ${status === 'pending'
                        ? 'bg-pending/20 text-pending shadow-md border border-pending/30'
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    <Clock className="w-4 h-4" />
                    Pendente
                  </button>
                  <button
                    onClick={() => setStatus('completed')}
                    className={`
                      py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                      ${status === 'completed'
                        ? 'bg-income/20 text-income shadow-md border border-income/30'
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    <Check className="w-4 h-4" />
                    Confirmado
                  </button>
                </div>
              </div>
            )}

            {/* Installment info (edit mode) */}
            {editTransaction && editTransaction.installmentNumber && editTransaction.totalInstallments && (
              <div className="mb-6 p-3 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Parcela</span>
                  <span className="text-sm font-semibold">
                    {editTransaction.installmentNumber} de {editTransaction.totalInstallments}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Sticky footer */}
          <div className="modal-footer-sticky sm:px-5 sm:pb-5">
            <button
              onClick={() => handleSubmit()}
              disabled={!title || !amount || !categoryId}
              className={`
                w-full rounded-xl py-3.5 text-base font-semibold
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${type === 'income'
                  ? 'bg-income text-income-foreground shadow-glow-income'
                  : 'bg-expense text-expense-foreground shadow-glow-expense'
                }
              `}
            >
              {editTransaction ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <TransactionUpdateModal
        isOpen={showUpdateScopeModal}
        onClose={() => {
          setShowUpdateScopeModal(false);
          setPendingUpdateData(null);
        }}
        onConfirm={handleUpdateScopeConfirm}
        transactionTitle={editTransaction?.title || ''}
      />
    </AnimatePresence>
  );
};
