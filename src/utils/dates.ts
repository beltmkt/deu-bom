import { format, startOfMonth, endOfMonth, addDays, subDays, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: ptBR });
};

export const formatDateLong = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, "dd 'de' MMMM", { locale: ptBR });
};

export const formatMonthYear = (date: Date): string => {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
};

export const getCustomCycleRange = (cycleStartDay: number, referenceDate: Date = new Date()) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();
  
  let startDate: Date;
  let endDate: Date;
  
  if (day >= cycleStartDay) {
    // Current cycle started this month
    startDate = new Date(year, month, cycleStartDay);
    endDate = subDays(new Date(year, month + 1, cycleStartDay), 1);
  } else {
    // Current cycle started last month
    startDate = new Date(year, month - 1, cycleStartDay);
    endDate = subDays(new Date(year, month, cycleStartDay), 1);
  }
  
  return { startDate, endDate };
};

export const isDateInCycle = (
  date: string | Date,
  cycleStartDay: number,
  referenceDate: Date = new Date()
): boolean => {
  const { startDate, endDate } = getCustomCycleRange(cycleStartDay, referenceDate);
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  return isWithinInterval(parsedDate, { start: startDate, end: endDate });
};

export const getRelativeDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);
  
  const diffTime = parsedDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays > 1 && diffDays <= 7) return `Em ${diffDays} dias`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} dias atrás`;
  
  return formatDate(parsedDate);
};
