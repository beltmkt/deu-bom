import { create } from 'zustand';
import { addMonths, addWeeks, addYears, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Transaction, Category, Budget, UserSettings } from '@/types/finance';

const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Salário', icon: 'Wallet', color: '#22c55e', type: 'income' },
  { name: 'Freelance', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { name: 'Investimentos', icon: 'TrendingUp', color: '#14b8a6', type: 'income' },
  { name: 'Outros', icon: 'Plus', color: '#06b6d4', type: 'income' },
  { name: 'Alimentação', icon: 'Utensils', color: '#f97316', type: 'expense' },
  { name: 'Transporte', icon: 'Car', color: '#eab308', type: 'expense' },
  { name: 'Moradia', icon: 'Home', color: '#ef4444', type: 'expense' },
  { name: 'Saúde', icon: 'Heart', color: '#ec4899', type: 'expense' },
  { name: 'Educação', icon: 'GraduationCap', color: '#8b5cf6', type: 'expense' },
  { name: 'Lazer', icon: 'Gamepad2', color: '#6366f1', type: 'expense' },
  { name: 'Assinaturas', icon: 'CreditCard', color: '#a855f7', type: 'expense' },
  { name: 'Compras', icon: 'ShoppingBag', color: '#d946ef', type: 'expense' },
];

const defaultSettings: UserSettings = {
  cycleStartDay: 1,
  currency: 'BRL',
  locale: 'pt-BR',
  notificationsEnabled: true,
};

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: UserSettings;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>, updateFuture?: boolean) => Promise<void>;
  deleteTransaction: (id: string, deleteFuture?: boolean, deleteAll?: boolean) => Promise<void>;
  toggleTransactionStatus: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  setBudget: (categoryId: string, limit: number) => Promise<void>;
  removeBudget: (categoryId: string) => Promise<void>;
  
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  
  exportData: () => string;
  importData: (data: string) => Promise<boolean>;
  
  generateInstallments: (baseTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, count: number) => Promise<void>;
  generateRecurringTransactions: (
    baseTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    count: number,
    interval: 'weekly' | 'monthly' | 'yearly',
    splitAmount: boolean
  ) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  categories: [],
  budgets: [],
  settings: defaultSettings,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      // Load profile/settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const workspaceId = profile?.current_workspace_id;

      // Load categories - user's own + workspace shared
      let categoriesQuery = supabase
        .from('categories')
        .select('*');
      
      if (workspaceId) {
        categoriesQuery = categoriesQuery.or(`user_id.eq.${user.id},workspace_id.eq.${workspaceId}`);
      } else {
        categoriesQuery = categoriesQuery.eq('user_id', user.id);
      }

      let { data: categories } = await categoriesQuery;

      // If no categories, create defaults
      if (!categories || categories.length === 0) {
        const categoriesToInsert = defaultCategories.map((c) => ({
          ...c,
          user_id: user.id,
          workspace_id: workspaceId || null,
        }));
        
        const { data: newCategories } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select();
        
        categories = newCategories;
      }

      // Load transactions - user's own + workspace shared
      let transactionsQuery = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (workspaceId) {
        transactionsQuery = transactionsQuery.or(`user_id.eq.${user.id},workspace_id.eq.${workspaceId}`);
      } else {
        transactionsQuery = transactionsQuery.eq('user_id', user.id);
      }

      const { data: transactions } = await transactionsQuery;

      // Load budgets
      let budgetsQuery = supabase
        .from('budgets')
        .select('*');

      if (workspaceId) {
        budgetsQuery = budgetsQuery.or(`user_id.eq.${user.id},workspace_id.eq.${workspaceId}`);
      } else {
        budgetsQuery = budgetsQuery.eq('user_id', user.id);
      }

      const { data: budgets } = await budgetsQuery;

      set({
        settings: profile ? {
          cycleStartDay: profile.cycle_start_day,
          currency: profile.currency,
          locale: profile.locale,
          notificationsEnabled: profile.notifications_enabled,
        } : defaultSettings,
        categories: (categories || []).map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type as 'income' | 'expense',
          budgetLimit: c.budget_limit ? Number(c.budget_limit) : undefined,
        })),
        transactions: (transactions || []).map((t) => ({
          id: t.id,
          title: t.title,
          amount: Number(t.amount),
          type: t.type as 'income' | 'expense',
          status: t.status as 'pending' | 'completed',
          categoryId: t.category_id || '',
          date: t.date,
          notes: t.notes || undefined,
          recurrenceType: t.recurrence_type as 'none' | 'installment' | 'subscription',
          installmentNumber: t.installment_number || undefined,
          totalInstallments: t.total_installments || undefined,
          parentTransactionId: t.parent_transaction_id || undefined,
          groupId: (t as any).group_id || undefined,
          recurrenceInterval: t.recurrence_interval as 'weekly' | 'monthly' | 'yearly' | undefined,
          recurrenceEndDate: t.recurrence_end_date || undefined,
          notify: t.notify,
          calendarEventId: t.calendar_event_id || undefined,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        })),
        budgets: (budgets || []).map((b) => ({
          id: b.id,
          categoryId: b.category_id,
          limit: Number(b.limit_amount),
          period: b.period as 'monthly' | 'weekly',
          spent: 0,
        })),
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error('Failed to initialize finance store:', error);
      set({ loading: false });
    }
  },

  addTransaction: async (transaction) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current workspace
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_workspace_id')
      .eq('id', user.id)
      .maybeSingle();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        workspace_id: profile?.current_workspace_id || null,
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        category_id: transaction.categoryId || null,
        date: transaction.date,
        notes: transaction.notes || null,
        recurrence_type: transaction.recurrenceType,
        installment_number: transaction.installmentNumber || null,
        total_installments: transaction.totalInstallments || null,
        parent_transaction_id: transaction.parentTransactionId || null,
        recurrence_interval: transaction.recurrenceInterval || null,
        recurrence_end_date: transaction.recurrenceEndDate || null,
        notify: transaction.notify,
      })
      .select()
      .single();

    if (!error && data) {
      const newTransaction: Transaction = {
        id: data.id,
        title: data.title,
        amount: Number(data.amount),
        type: data.type as 'income' | 'expense',
        status: data.status as 'pending' | 'completed',
        categoryId: data.category_id || '',
        date: data.date,
        notes: data.notes || undefined,
        recurrenceType: data.recurrence_type as 'none' | 'installment' | 'subscription',
        installmentNumber: data.installment_number || undefined,
        totalInstallments: data.total_installments || undefined,
        parentTransactionId: data.parent_transaction_id || undefined,
        recurrenceInterval: data.recurrence_interval as 'weekly' | 'monthly' | 'yearly' | undefined,
        recurrenceEndDate: data.recurrence_end_date || undefined,
        notify: data.notify,
        calendarEventId: data.calendar_event_id || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
      }));
    }
  },

  updateTransaction: async (id, updates, updateFuture = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.notify !== undefined) dbUpdates.notify = updates.notify;

    const { error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      }));

      // Handle future updates for installments
      if (updateFuture) {
        const transaction = get().transactions.find((t) => t.id === id);
        if (transaction?.parentTransactionId) {
          const futureTransactions = get().transactions.filter(
            (t) =>
              t.parentTransactionId === transaction.parentTransactionId &&
              (t.installmentNumber || 0) > (transaction.installmentNumber || 0)
          );

          for (const ft of futureTransactions) {
            await supabase
              .from('transactions')
              .update(dbUpdates)
              .eq('id', ft.id);
          }

          set((state) => ({
            transactions: state.transactions.map((t) => {
              if (
                t.parentTransactionId === transaction.parentTransactionId &&
                (t.installmentNumber || 0) > (transaction.installmentNumber || 0)
              ) {
                return { ...t, ...updates, updatedAt: new Date().toISOString() };
              }
              return t;
            }),
          }));
        }
      }
    }
  },

  deleteTransaction: async (id, deleteFuture = false, deleteAll = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;

    // Delete all in the group/series
    if (deleteAll) {
      const groupKey = transaction.groupId || transaction.parentTransactionId;
      if (groupKey) {
        const allIds = get()
          .transactions.filter(
            (t) => t.groupId === groupKey || t.parentTransactionId === groupKey || t.id === groupKey
          )
          .map((t) => t.id);

        for (const fId of allIds) {
          await supabase.from('transactions').delete().eq('id', fId);
        }

        set((state) => ({
          transactions: state.transactions.filter((t) => !allIds.includes(t.id)),
        }));
        return;
      }
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));

      if (deleteFuture) {
        const groupKey = transaction.groupId || transaction.parentTransactionId;
        if (groupKey) {
          const futureIds = get()
            .transactions.filter(
              (t) =>
                (t.groupId === groupKey || t.parentTransactionId === groupKey) &&
                (t.installmentNumber || 0) > (transaction.installmentNumber || 0)
            )
            .map((t) => t.id);

          for (const fId of futureIds) {
            await supabase.from('transactions').delete().eq('id', fId);
          }

          set((state) => ({
            transactions: state.transactions.filter((t) => !futureIds.includes(t.id)),
          }));
        }
      }
    }
  },

  toggleTransactionStatus: async (id) => {
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;

    const newStatus = transaction.status === 'completed' ? 'pending' : 'completed';
    await get().updateTransaction(id, { status: newStatus });
  },

  addCategory: async (category) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_workspace_id')
      .eq('id', user.id)
      .maybeSingle();

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        workspace_id: profile?.current_workspace_id || null,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        budget_limit: category.budgetLimit || null,
      })
      .select()
      .single();

    if (!error && data) {
      set((state) => ({
        categories: [
          ...state.categories,
          {
            id: data.id,
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type as 'income' | 'expense',
            budgetLimit: data.budget_limit ? Number(data.budget_limit) : undefined,
          },
        ],
      }));
    }
  },

  updateCategory: async (id, updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.budgetLimit !== undefined) dbUpdates.budget_limit = updates.budgetLimit;

    const { error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }));
    }
  },

  deleteCategory: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    }
  },

  setBudget: async (categoryId, limit) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingBudget = get().budgets.find((b) => b.categoryId === categoryId);

    if (existingBudget) {
      const { error } = await supabase
        .from('budgets')
        .update({ limit_amount: limit })
        .eq('id', existingBudget.id);

      if (!error) {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.categoryId === categoryId ? { ...b, limit } : b
          ),
        }));
      }
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          limit_amount: limit,
          period: 'monthly',
        })
        .select()
        .single();

      if (!error && data) {
        set((state) => ({
          budgets: [
            ...state.budgets,
            {
              id: data.id,
              categoryId: data.category_id,
              limit: Number(data.limit_amount),
              period: data.period as 'monthly' | 'weekly',
              spent: 0,
            },
          ],
        }));
      }
    }
  },

  removeBudget: async (categoryId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const budget = get().budgets.find((b) => b.categoryId === categoryId);
    if (!budget) return;

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budget.id);

    if (!error) {
      set((state) => ({
        budgets: state.budgets.filter((b) => b.categoryId !== categoryId),
      }));
    }
  },

  updateSettings: async (newSettings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (newSettings.cycleStartDay !== undefined) dbUpdates.cycle_start_day = newSettings.cycleStartDay;
    if (newSettings.currency !== undefined) dbUpdates.currency = newSettings.currency;
    if (newSettings.locale !== undefined) dbUpdates.locale = newSettings.locale;
    if (newSettings.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = newSettings.notificationsEnabled;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (!error) {
      set((state) => ({
        settings: { ...state.settings, ...newSettings },
      }));
    }
  },

  exportData: () => {
    const state = get();
    return JSON.stringify(
      {
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        settings: state.settings,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importData: async (data) => {
    // Define validation schemas for imported data
    const categorySchema = z.object({
      name: z.string().min(1, "Nome da categoria é obrigatório").max(100),
      icon: z.string().min(1).max(50).default('Circle'),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").default('#6366f1'),
      type: z.enum(['income', 'expense']),
      budgetLimit: z.number().positive().optional().nullable(),
    });

    const transactionSchema = z.object({
      title: z.string().min(1, "Título é obrigatório").max(200),
      amount: z.number().positive("Valor deve ser positivo"),
      type: z.enum(['income', 'expense']),
      status: z.enum(['pending', 'completed']).default('pending'),
      categoryId: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
      notes: z.string().max(1000).optional().nullable(),
      recurrenceType: z.enum(['none', 'installment', 'subscription']).default('none'),
      notify: z.boolean().default(false),
    });

    const importSchema = z.object({
      categories: z.array(categorySchema).optional(),
      transactions: z.array(transactionSchema).optional(),
      exportedAt: z.string().optional(),
    });

    try {
      const parsed = JSON.parse(data);
      
      // Validate the imported data against the schema
      const validationResult = importSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.error('Import validation failed:', validationResult.error.errors);
        toast.error(`Dados inválidos: ${validationResult.error.errors[0]?.message || 'Formato incorreto'}`);
        return false;
      }

      const validData = validationResult.data;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Import categories
      if (validData.categories && validData.categories.length > 0) {
        for (const cat of validData.categories) {
          await get().addCategory({
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            budgetLimit: cat.budgetLimit ?? undefined,
          });
        }
      }

      // Import transactions
      if (validData.transactions && validData.transactions.length > 0) {
        for (const trans of validData.transactions) {
          await get().addTransaction({
            title: trans.title,
            amount: trans.amount,
            type: trans.type,
            status: trans.status,
            categoryId: trans.categoryId || '',
            date: trans.date,
            notes: trans.notes ?? undefined,
            recurrenceType: trans.recurrenceType,
            notify: trans.notify,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao processar arquivo de importação');
      return false;
    }
  },

  generateInstallments: async (baseTransaction, count) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const parentId = crypto.randomUUID();
    const amountPerInstallment = baseTransaction.amount / count;

    for (let i = 0; i < count; i++) {
      const date = addMonths(new Date(baseTransaction.date), i);

      await get().addTransaction({
        ...baseTransaction,
        amount: amountPerInstallment,
        installmentNumber: i + 1,
        totalInstallments: count,
        parentTransactionId: parentId,
        title: `${baseTransaction.title} (${i + 1}/${count})`,
        date: format(date, 'yyyy-MM-dd'),
      });
    }
  },

  generateRecurringTransactions: async (baseTransaction, count, interval, splitAmount) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_workspace_id')
      .eq('id', user.id)
      .maybeSingle();

    const groupId = crypto.randomUUID();
    const amountPerTransaction = splitAmount ? baseTransaction.amount / count : baseTransaction.amount;
    const baseDate = new Date(baseTransaction.date);

    const addDateByInterval = (date: Date, index: number): Date => {
      switch (interval) {
        case 'weekly':
          return addWeeks(date, index);
        case 'monthly':
          return addMonths(date, index);
        case 'yearly':
          return addYears(date, index);
        default:
          return addMonths(date, index);
      }
    };

    const transactionsToInsert = [];
    for (let i = 0; i < count; i++) {
      const transactionDate = addDateByInterval(baseDate, i);
      transactionsToInsert.push({
        user_id: user.id,
        workspace_id: profile?.current_workspace_id || null,
        title: splitAmount ? `${baseTransaction.title} (${i + 1}/${count})` : baseTransaction.title,
        amount: amountPerTransaction,
        type: baseTransaction.type,
        status: baseTransaction.status,
        category_id: baseTransaction.categoryId || null,
        date: format(transactionDate, 'yyyy-MM-dd'),
        notes: baseTransaction.notes || null,
        recurrence_type: baseTransaction.recurrenceType,
        installment_number: splitAmount ? i + 1 : null,
        total_installments: splitAmount ? count : null,
        parent_transaction_id: null,
        group_id: groupId,
        recurrence_interval: interval,
        recurrence_end_date: baseTransaction.recurrenceEndDate || null,
        notify: baseTransaction.notify,
      });
    }

    // Single batch insert
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)
      .select();

    if (error) {
      console.error('Failed to insert recurring transactions:', error);
      toast.error('Erro ao salvar transações recorrentes');
      return;
    }

    if (data && data.length > 0) {
      const newTransactions: Transaction[] = data.map((t) => ({
        id: t.id,
        title: t.title,
        amount: Number(t.amount),
        type: t.type as 'income' | 'expense',
        status: t.status as 'pending' | 'completed',
        categoryId: t.category_id || '',
        date: t.date,
        notes: t.notes || undefined,
        recurrenceType: t.recurrence_type as 'none' | 'installment' | 'subscription',
        installmentNumber: t.installment_number || undefined,
        totalInstallments: t.total_installments || undefined,
        parentTransactionId: t.parent_transaction_id || undefined,
        groupId: (t as any).group_id || undefined,
        recurrenceInterval: t.recurrence_interval as 'weekly' | 'monthly' | 'yearly' | undefined,
        recurrenceEndDate: t.recurrence_end_date || undefined,
        notify: t.notify,
        calendarEventId: t.calendar_event_id || undefined,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      set((state) => ({
        transactions: [...newTransactions, ...state.transactions],
      }));
    }
  },
}));

// Selectors
export const useTransactions = () => useFinanceStore((state) => state.transactions);
export const useCategories = () => useFinanceStore((state) => state.categories);
export const useBudgets = () => useFinanceStore((state) => state.budgets);
export const useSettings = () => useFinanceStore((state) => state.settings);
export const useFinanceLoading = () => useFinanceStore((state) => state.loading);

export const useCurrentBalance = () => {
  const transactions = useTransactions();
  return transactions
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
};

export const useProjectedBalance = () => {
  const transactions = useTransactions();
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
};

export const useCategoryById = (id: string) => {
  const categories = useCategories();
  return categories.find((c) => c.id === id);
};

export const useBudgetByCategory = (categoryId: string) => {
  const budgets = useBudgets();
  const transactions = useTransactions();
  const budget = budgets.find((b) => b.categoryId === categoryId);

  if (!budget) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const spent = transactions
    .filter(
      (t) =>
        t.categoryId === categoryId &&
        t.status === 'completed' &&
        new Date(t.date) >= startOfMonth
    )
    .reduce((acc, t) => acc + t.amount, 0);

  return { ...budget, spent };
};
