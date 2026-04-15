import { format, addDays } from 'date-fns';

interface CalendarEventData {
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  notes?: string;
}

/**
 * Generates an iCalendar (.ics) file content for the event.
 * This format is universally supported by Gmail, Outlook, Apple Calendar, etc.
 */
export function generateICSContent(event: CalendarEventData): string {
  const eventDate = new Date(event.date);
  const startDate = format(eventDate, 'yyyyMMdd');
  const endDate = format(addDays(eventDate, 1), 'yyyyMMdd');
  
  const amountFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(event.amount);
  
  const typeLabel = event.type === 'income' ? 'Receita' : 'Despesa';
  const emoji = event.type === 'income' ? '💰' : '💸';
  
  let description = `${typeLabel}: ${amountFormatted}`;
  if (event.notes) {
    description += `\\n\\nObservações: ${event.notes}`;
  }
  description += '\\n\\n— Adicionado via Finanças App';
  
  // Generate a unique ID for the event
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@financas-app`;
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
  
  // iCalendar format specification
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Finanças App//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${emoji} ${event.title}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  
  return icsContent;
}

interface SimpleCalendarEvent {
  summary: string;
  description: string;
  date: string;
}

/**
 * Generates and downloads an .ics file for a simple event.
 */
export function generateICSFile(event: SimpleCalendarEvent): void {
  const eventDate = new Date(event.date);
  const startDate = format(eventDate, 'yyyyMMdd');
  const endDate = format(addDays(eventDate, 1), 'yyyyMMdd');
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@financas-app`;
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Finanças App//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const safeTitle = event.summary.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const filename = `${safeTitle}_${event.date}.ics`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Downloads an iCalendar file for the event.
 * Works on all devices and opens in the default calendar app.
 */
export function downloadCalendarFile(event: CalendarEventData): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  // Create a safe filename
  const safeTitle = event.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const filename = `${safeTitle}_${event.date}.ics`;
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(link.href);
}
