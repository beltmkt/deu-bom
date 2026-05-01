import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Check, Home } from 'lucide-react';
import { generateICSFile } from '@/utils/calendarFile';

const CalendarEvent = () => {
  const [searchParams] = useSearchParams();

  const event = useMemo(
    () => ({
      summary: searchParams.get('title') || 'Evento Deu Bom',
      description: searchParams.get('description') || 'Convite enviado pelo Deu Bom.',
      date: searchParams.get('date') || new Date().toISOString().slice(0, 10),
      time: searchParams.get('time') || undefined,
    }),
    [searchParams]
  );

  useEffect(() => {
    generateICSFile(event);
  }, [event]);

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Calendar className="h-7 w-7" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Agenda
        </p>
        <h1 className="mt-2 text-2xl font-bold">{event.summary}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O arquivo da agenda foi gerado. No celular, toque no arquivo baixado para salvar no app de calendario instalado.
        </p>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => generateICSFile(event)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            <Check className="h-4 w-4" />
            Gerar convite da agenda
          </button>
          <Link
            to="/festometro"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold"
          >
            <Home className="h-4 w-4" />
            Abrir Festometro
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CalendarEvent;
