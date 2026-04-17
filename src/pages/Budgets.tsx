import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClock,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react';
import { addMonths, differenceInMonths, endOfMonth, format, isWithinInterval, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { CurrencyInput } from '@/components/CurrencyInput';
import { EmptyState } from '@/components/EmptyState';
import { PageIntro } from '@/components/PageIntro';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import {
  useFinanceLoading,
  useFinanceStore,
  useTransactions,
} from '@/stores/financeStore';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';

interface PurchaseGoal {
  id: string;
  title: string;
  category?: string | null;
  target_amount: number;
  current_amount: number;
  monthly_target?: number | null;
  target_date?: string | null;
  notes?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

const priorityLabel: Record<PurchaseGoal['priority'], string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

const getGoalTip = (
  remaining: number,
  recommendedMonthly: number,
  avgMonthlyReserve: number
) => {
  if (remaining <= 0) {
    return 'Meta batida. Agora vale decidir se voce quer comprar ou abrir um novo objetivo.';
  }

  if (avgMonthlyReserve <= 0) {
    return 'Seu caixa recente esta apertado. Comece com aportes pequenos e revise despesas variaveis antes de acelerar.';
  }

  if (recommendedMonthly <= avgMonthlyReserve * 0.4) {
    return 'Meta saudavel. Separar esse valor logo no inicio do mes tende a funcionar melhor.';
  }

  if (recommendedMonthly <= avgMonthlyReserve) {
    return 'Da para chegar, mas exige disciplina. Automatizar a reserva ajuda bastante.';
  }

  return 'No ritmo atual essa meta esta agressiva. Vale alongar o prazo ou aumentar a entrada inicial.';
};

const Budgets: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace, canEdit, loading: workspaceLoading } = useWorkspace();
  const transactions = useTransactions();
  const loading = useFinanceLoading();
  const initialize = useFinanceStore((state) => state.initialize);
  const initialized = useFinanceStore((state) => state.initialized);

  const [goals, setGoals] = useState<PurchaseGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<PurchaseGoal['priority']>('medium');

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  const loadGoals = async () => {
    if (!user) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }

    setGoalsLoading(true);

    try {
      const db = supabase as any;
      let query = db.from('purchase_goals').select('*').order('created_at', { ascending: false });

      if (currentWorkspace?.id) {
        query = query.eq('workspace_id', currentWorkspace.id);
      } else {
        query = query.eq('user_id', user.id).is('workspace_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;

      setGoals((data || []) as PurchaseGoal[]);
    } catch (error) {
      console.error('Failed to load purchase goals:', error);
      toast.error('Nao foi possivel carregar suas metas');
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceLoading) {
      loadGoals();
    }
  }, [workspaceLoading, currentWorkspace?.id, user?.id]);

  const monthlyBalances = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = subMonths(new Date(), 5 - index);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter((transaction) =>
        transaction.status === 'completed' &&
        isWithinInterval(parseISO(transaction.date), { start: monthStart, end: monthEnd })
      );

      const income = monthTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

      const expense = monthTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

      return {
        label: format(monthDate, 'MMM', { locale: ptBR }),
        balance: income - expense,
      };
    });
  }, [transactions]);

  const avgMonthlyReserve = useMemo(() => {
    if (monthlyBalances.length === 0) return 0;

    const positiveMonths = monthlyBalances.map((item) => Math.max(item.balance, 0));
    return positiveMonths.reduce((total, value) => total + value, 0) / positiveMonths.length;
  }, [monthlyBalances]);

  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const totalTarget = activeGoals.reduce((total, goal) => total + goal.target_amount, 0);
  const totalSaved = activeGoals.reduce((total, goal) => total + goal.current_amount, 0);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setMonthlyTarget(0);
    setTargetDate('');
    setNotes('');
    setPriority('medium');
  };

  const handleCreateGoal = async () => {
    if (!user || !title.trim() || targetAmount <= 0) return;

    try {
      const db = supabase as any;
      const { error } = await db.from('purchase_goals').insert({
        user_id: user.id,
        workspace_id: currentWorkspace?.id || null,
        title: title.trim(),
        category: category.trim() || null,
        target_amount: targetAmount,
        current_amount: currentAmount,
        monthly_target: monthlyTarget > 0 ? monthlyTarget : null,
        target_date: targetDate || null,
        notes: notes.trim() || null,
        priority,
        status: currentAmount >= targetAmount ? 'completed' : 'active',
      });

      if (error) throw error;

      toast.success('Meta criada com sucesso');
      setIsFormOpen(false);
      resetForm();
      await loadGoals();
    } catch (error) {
      console.error('Failed to create purchase goal:', error);
      toast.error('Nao foi possivel salvar a meta');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const db = supabase as any;
      const { error } = await db.from('purchase_goals').delete().eq('id', goalId);
      if (error) throw error;

      toast.success('Meta removida');
      await loadGoals();
    } catch (error) {
      console.error('Failed to delete purchase goal:', error);
      toast.error('Nao foi possivel remover a meta');
    }
  };

  if (loading || workspaceLoading || goalsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Metas"
        title="Compras futuras com mais clareza"
        description="Registre desejos e objetivos como carro, tenis, viagem ou celular e veja quanto guardar, em que ritmo e quando vale comprar."
        actions={
          canEdit ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
            >
              Nova meta
            </button>
          ) : undefined
        }
      >
        <p className="text-sm text-muted-foreground">
          Reserva media recente: {formatCurrency(avgMonthlyReserve)} por mes
        </p>
      </PageIntro>

      <section className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Total planejado
            </span>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(totalTarget)}</p>
        </SurfaceCard>

        <SurfaceCard>
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Ja guardado
            </span>
          </div>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(totalSaved)}</p>
        </SurfaceCard>

        <SurfaceCard>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Ritmo sugerido
            </span>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(avgMonthlyReserve)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Valor medio que seu historico recente comporta melhor.
          </p>
        </SurfaceCard>
      </section>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada"
          description="Crie metas para acompanhar compras futuras com objetivo, prazo e estrategia de reserva."
          action={
            canEdit ? (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Criar meta
              </button>
            ) : undefined
          }
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="grid gap-4">
            {goals.map((goal, index) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
              const targetDateValue = goal.target_date ? new Date(goal.target_date) : addMonths(new Date(), 6);
              const monthsUntilGoal = Math.max(differenceInMonths(targetDateValue, new Date()), 1);
              const recommendedMonthly =
                goal.monthly_target && goal.monthly_target > 0
                  ? goal.monthly_target
                  : remaining / monthsUntilGoal;
              const tip = getGoalTip(remaining, recommendedMonthly, avgMonthlyReserve);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-[28px] border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{goal.title}</h2>
                        <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                          Prioridade {priorityLabel[goal.priority]}
                        </span>
                        {goal.category ? (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">
                            {goal.category}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {goal.target_date
                          ? `Meta para ${format(new Date(goal.target_date), "MMMM 'de' yyyy", { locale: ptBR })}`
                          : 'Meta sem prazo definido'}
                      </p>
                    </div>

                    {canEdit ? (
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Objetivo</p>
                      <p className="mt-1 text-lg font-semibold">{formatCurrency(goal.target_amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Ja guardado</p>
                      <p className="mt-1 text-lg font-semibold text-primary">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Falta</p>
                      <p className="mt-1 text-lg font-semibold">{formatCurrency(remaining)}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{progress.toFixed(0)}% da meta</span>
                    <span className="font-medium">Guardar {formatCurrency(recommendedMonthly)}/mes</span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/50 p-4">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Dica pratica</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{tip}</p>
                    {goal.notes ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Observacao: {goal.notes}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-4">
            <SurfaceCard>
              <h2 className="text-lg font-semibold">Como pensar a compra</h2>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <p>Reserve o valor da meta logo no inicio do mes, antes do dinheiro se misturar com gasto variavel.</p>
                <p>Se a parcela mensal sugerida ficou alta demais, aumente o prazo ou suba a entrada inicial.</p>
                <p>Use prioridade alta para objetivos com data real e prioridade media para desejos que ainda podem esperar.</p>
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <h2 className="text-lg font-semibold">Janela de compra</h2>
              <div className="mt-4 space-y-3">
                {activeGoals.slice(0, 3).map((goal) => {
                  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
                  const monthlyPace =
                    goal.monthly_target && goal.monthly_target > 0 ? goal.monthly_target : avgMonthlyReserve || 1;
                  const monthsNeeded = Math.ceil(remaining / Math.max(monthlyPace, 1));

                  return (
                    <div key={goal.id} className="rounded-2xl bg-muted/50 p-4">
                      <p className="font-medium">{goal.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Se voce guardar {formatCurrency(monthlyPace)} por mes, chega em cerca de {monthsNeeded} mes(es).
                      </p>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </div>
        </section>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 mx-auto max-h-[90vh] max-w-2xl overflow-auto rounded-t-[28px] bg-card p-6"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Nova meta de compra</h2>
                  <p className="text-sm text-muted-foreground">
                    Registre algo que voce quer comprar e monte o caminho ate la.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-4 pb-24">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Nome da meta</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex: Carro, tenis, notebook, viagem"
                    className="w-full rounded-2xl border border-border bg-input px-4 py-4"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Categoria</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      placeholder="Ex: Mobilidade, estilo, trabalho"
                      className="w-full rounded-2xl border border-border bg-input px-4 py-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Prazo alvo</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(event) => setTargetDate(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-input px-4 py-4"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Valor alvo</label>
                    <CurrencyInput value={targetAmount} onChange={setTargetAmount} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Ja guardado</label>
                    <CurrencyInput value={currentAmount} onChange={setCurrentAmount} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Guardar por mes</label>
                    <CurrencyInput value={monthlyTarget} onChange={setMonthlyTarget} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Prioridade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((value) => (
                      <button
                        key={value}
                        onClick={() => setPriority(value)}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                          priority === value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {priorityLabel[value]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Observacoes</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    placeholder="Ex: quero comprar a vista, quero esperar promocao, prefiro terminar ate dezembro..."
                    className="w-full rounded-2xl border border-border bg-input px-4 py-4"
                  />
                </div>
              </div>

              <div className="modal-footer-sticky">
                <button
                  onClick={handleCreateGoal}
                  disabled={!title.trim() || targetAmount <= 0}
                  className="w-full rounded-2xl bg-primary py-4 text-lg font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Salvar meta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </AppShell>
  );
};

export default Budgets;
