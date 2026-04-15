import { format } from 'date-fns';

interface CalendarEventData {
  title: string;
  date: string;
  time?: string;
  amount: number;
  type: 'income' | 'expense';
  notes?: string;
  attendeeEmails?: string[];
}

/**
 * Generates a Google Calendar URL that opens the calendar with a pre-filled event.
 * This uses the Google Calendar "add event" URL format which works without OAuth.
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  
  // Format the date for Google Calendar
  let startDateTime: string;
  let endDateTime: string;
  
  if (event.time) {
    // With time: use full datetime format (YYYYMMDDTHHMMSS)
    const [hours, minutes] = event.time.split(':').map(Number);
    const dateObj = new Date(event.date);
    dateObj.setHours(hours, minutes, 0, 0);
    startDateTime = format(dateObj, "yyyyMMdd'T'HHmmss");
    
    // End time: 2 hours after start
    const endDateObj = new Date(dateObj);
    endDateObj.setHours(endDateObj.getHours() + 2);
    endDateTime = format(endDateObj, "yyyyMMdd'T'HHmmss");
  } else {
    // Without time: use all-day format (YYYYMMDD)
    const eventDate = format(new Date(event.date), 'yyyyMMdd');
    startDateTime = eventDate;
    endDateTime = eventDate;
  }
  
  // Create the event title
  const title = `${event.type === 'income' ? '💰' : '🎉'} ${event.title}`;
  
  // Create the description with amount and notes
  const amountFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(event.amount);
  
  let description = `${event.type === 'income' ? 'Receita' : 'Despesa'}: ${amountFormatted}`;
  if (event.notes) {
    description += `\n\nObservações: ${event.notes}`;
  }
  description += '\n\n— Adicionado via DeuBom!!';
  
  // Build the URL with query parameters
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDateTime}/${endDateTime}`,
    details: description,
    sf: 'true',
    output: 'xml',
  });
  
  // Add attendee emails if provided
  if (event.attendeeEmails && event.attendeeEmails.length > 0) {
    params.set('add', event.attendeeEmails.join(','));
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Opens the Google Calendar in a new tab with the pre-filled event
 */
export function openGoogleCalendar(event: CalendarEventData): void {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
}
