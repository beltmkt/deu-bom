export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'completed';
export type RecurrenceType = 'none' | 'installment' | 'subscription';
export type RecurrenceInterval = 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budgetLimit?: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  categoryId: string;
  date: string;
  notes?: string;
  
  // Recurrence
  recurrenceType: RecurrenceType;
  
  // For installments
  installmentNumber?: number;
  totalInstallments?: number;
  parentTransactionId?: string;
  
  // Group ID to link recurring transactions
  groupId?: string;
  
  // For subscriptions
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: string;
  
  // Notifications
  notify: boolean;
  calendarEventId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: 'monthly' | 'weekly';
  spent: number;
}

export interface UserSettings {
  cycleStartDay: number;
  currency: string;
  locale: string;
  notificationsEnabled: boolean;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: UserSettings;
  
  // Computed
  currentBalance: number;
  projectedBalance: number;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>, updateFuture?: boolean) => void;
  deleteTransaction: (id: string, deleteFuture?: boolean) => void;
  toggleTransactionStatus: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  setBudget: (categoryId: string, limit: number) => void;
  removeBudget: (categoryId: string) => void;
  
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Import/Export
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // Installments
  generateInstallments: (baseTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, count: number) => void;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { date: string } | { dateTime: string };
  end: { date: string } | { dateTime: string };
}
