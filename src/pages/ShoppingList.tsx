import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Loader2,
  Mic,
  MicOff,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { parseVoiceCommand } from '@/services/voiceCommandParser';
import type { ShoppingListItem } from '@/types/shopping';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STORAGE_KEY = 'deu-bom-shopping-list-v1';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadItems = (): ShoppingListItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ShoppingListItem[]) : [];
  } catch {
    return [];
  }
};

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('un');
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    setItems(loadItems());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loading]);

  const totals = useMemo(() => {
    const pending = items.filter((item) => !item.checked);
    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.estimatedPrice,
      0
    );
    const pendingTotal = pending.reduce(
      (sum, item) => sum + item.quantity * item.estimatedPrice,
      0
    );

    return {
      count: items.length,
      checked: items.length - pending.length,
      total,
      pendingTotal,
    };
  }, [items]);

  const addItem = (item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setItems((current) => [
      {
        ...item,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) return;

    addItem({
      name: name.trim(),
      quantity: Math.max(1, quantity),
      unit: unit.trim() || 'un',
      estimatedPrice: Math.max(0, estimatedPrice),
      checked: false,
    });

    setName('');
    setQuantity(1);
    setUnit('un');
    setEstimatedPrice(0);
    toast.success('Item adicionado na lista.');
  };

  const handleVoiceTranscript = (transcript: string) => {
    const command = parseVoiceCommand(transcript);

    if (!command || command.kind !== 'shopping') {
      toast.error('Diga algo como: adicionar arroz 2 pacotes por 18 reais na lista.');
      return;
    }

    addItem({
      name: command.name,
      quantity: command.quantity,
      unit: command.unit,
      estimatedPrice: command.estimatedPrice,
      checked: false,
    });

    toast.success(`Adicionado: ${command.name}.`);
  };

  const { isListening, startListening, stopListening } = useVoiceCommand({
    onTranscript: handleVoiceTranscript,
  });

  const toggleItem = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    toast.success('Item removido.');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-[calc(var(--app-bottom-nav-height,0px)+1rem+env(safe-area-inset-bottom,0px))] md:pl-[var(--app-sidebar-width,88px)]">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Lista de compras
              </p>
              <h1 className="text-xl font-semibold sm:text-2xl">Mercado sem esquecer nada</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Anote itens, quantidades e previsao de gasto.
              </p>
            </div>
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors',
                isListening
                  ? 'bg-expense text-expense-foreground'
                  : 'bg-primary text-primary-foreground'
              )}
              aria-label={isListening ? 'Parar gravacao' : 'Adicionar por voz'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Itens</p>
              <p className="mt-0.5 text-sm font-semibold">{totals.count}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Comprados</p>
              <p className="mt-0.5 text-sm font-semibold">{totals.checked}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Previsto</p>
              <p className="mt-0.5 text-sm font-semibold">{formatCurrency(totals.total)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)]"
        >
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_96px_96px_120px_auto]">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Item"
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Quantidade"
            />
            <input
              type="text"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Unidade"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={estimatedPrice}
              onChange={(event) => setEstimatedPrice(Number(event.target.value))}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Valor estimado"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </form>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Sua lista esta vazia"
            description="Adicione pelo formulario ou toque no microfone e fale o item."
          />
        ) : (
          <section className="space-y-2">
            {items.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-border bg-card p-3',
                  item.checked && 'bg-muted/40 text-muted-foreground'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                    item.checked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  )}
                  aria-label={item.checked ? 'Desmarcar item' : 'Marcar item comprado'}
                >
                  <Check className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-semibold', item.checked && 'line-through')}>
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quantity} {item.unit} | {formatCurrency(item.estimatedPrice)} cada
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(item.quantity * item.estimatedPrice)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-expense"
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ShoppingList;
