export const formatCurrency = (value: number, locale = 'pt-BR', currency = 'BRL'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const formatCurrencyInput = (value: string): string => {
  // Remove all non-numeric characters except comma
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (!numericValue) return '';
  
  // Convert to number (cents to reais)
  const number = parseInt(numericValue, 10) / 100;
  
  // Format as Brazilian currency
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const currencyInputToNumber = (value: string): number => {
  const numericValue = value.replace(/[^\d]/g, '');
  if (!numericValue) return 0;
  return parseInt(numericValue, 10) / 100;
};

export const numberToCurrencyInput = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
