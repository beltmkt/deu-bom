import { generateICSFile } from '@/utils/calendarFile';

class CalendarService {
  /**
   * Creates a calendar event by generating and downloading an .ics file.
   * This approach is secure as it doesn't require storing API keys client-side.
   */
  createTransactionEvent(
    title: string,
    amount: number,
    date: string,
    type: 'income' | 'expense'
  ): void {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    const summary = `${type === 'income' ? '💰' : '💸'} ${title} - ${formattedAmount}`;
    const description = `Transação financeira: ${title}\nValor: ${formattedAmount}\nTipo: ${type === 'income' ? 'Receita' : 'Despesa'}`;

    generateICSFile({
      summary,
      description,
      date,
    });
  }
}

export const calendarService = new CalendarService();
