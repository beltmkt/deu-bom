import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  Loader2,
  LogOut,
  Mail,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { PageIntro } from '@/components/PageIntro';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { SurfaceCard } from '@/components/SurfaceCard';
import { WorkspaceInviteModal } from '@/components/WorkspaceInviteModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFinanceStore, useSettings } from '@/stores/financeStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';

const themeOptions = [
  { id: 'light' as const, label: 'Claro', icon: Sun },
  { id: 'dark' as const, label: 'Escuro', icon: Moon },
  { id: 'system' as const, label: 'Sistema', icon: Monitor },
];

const Settings: React.FC = () => {
  const settings = useSettings();
  const {
    exportData,
    importData,
    updateSettings,
    initialize,
    initialized,
    refreshData,
  } = useFinanceStore();
  const { user, signOut } = useAuth();
  const {
    currentWorkspace,
    members,
    userRole,
    inviteUser,
    refreshWorkspace,
  } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingWorkspaceName, setIsEditingWorkspaceName] = useState(false);
  const [workspaceNameInput, setWorkspaceNameInput] = useState('');
  const [isSavingWorkspaceName, setIsSavingWorkspaceName] = useState(false);
  const [profileData, setProfileData] = useState({ displayName: '', email: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const canManageWorkspace = userRole === 'owner';
  const canDeleteScopeData = !currentWorkspace || userRole === 'owner';
  const deleteScopeLabel = currentWorkspace ? currentWorkspace.name : 'EXCLUIR';

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      toast.error('Este navegador nao suporta notificacoes.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast.success('Notificacoes ativadas neste dispositivo.');
    } else {
      toast.error('Permissao de notificacao nao concedida.');
    }
  };

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfileData({
        displayName: data.display_name || '',
        email: data.email || user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const stats = useMemo(
    () => [
      {
        label: 'Usuario',
        value: profileData.displayName || user?.email || 'Sem identificacao',
      },
      {
        label: 'Workspace',
        value: currentWorkspace?.name || 'Sem workspace ativo',
      },
      {
        label: 'Acesso',
        value:
          userRole === 'owner'
            ? 'Proprietario'
            : userRole === 'editor'
            ? 'Editor'
            : userRole === 'viewer'
            ? 'Visualizador'
            : 'Usuario',
      },
    ],
    [currentWorkspace?.name, profileData.displayName, user?.email, userRole]
  );

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Logout realizado com sucesso.');
    } catch {
      toast.error('Erro ao fazer logout.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `financas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso.');
  };

  const handleExportCSV = () => {
    const state = useFinanceStore.getState();
    const categories = state.categories;
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor', 'Status'];
    const rows = state.transactions.map((transaction) => {
      const category = categories.find((item) => item.id === transaction.categoryId);
      return [
        transaction.date,
        transaction.title,
        category?.name || '',
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        transaction.amount.toFixed(2).replace('.', ','),
        transaction.status === 'completed' ? 'Concluido' : 'Pendente',
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `financas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso.');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const content = loadEvent.target?.result as string;
      const success = await importData(content);
      if (success) {
        toast.success('Dados importados com sucesso.');
      } else {
        toast.error('Erro ao importar dados. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor', 'Status'];
    const exampleRows = [
      ['2025-01-15', 'Salario', 'Salario', 'Receita', '5000,00', 'Concluido'],
      ['2025-01-16', 'Supermercado', 'Alimentacao', 'Despesa', '350,50', 'Concluido'],
      ['2025-01-20', 'Conta de Luz', 'Contas', 'Despesa', '180,00', 'Pendente'],
      ['2025-01-25', 'Freelance', 'Renda Extra', 'Receita', '1200,00', 'Pendente'],
    ];

    const csv = [headers, ...exampleRows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'modelo-importacao.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success('Modelo baixado com sucesso.');
  };

  const handleStartEditWorkspaceName = () => {
    setWorkspaceNameInput(currentWorkspace?.name || '');
    setIsEditingWorkspaceName(true);
  };

  const handleSaveWorkspaceName = async () => {
    if (!currentWorkspace || !workspaceNameInput.trim()) return;

    setIsSavingWorkspaceName(true);
    try {
      const { error } = await supabase.rpc('update_workspace_name', {
        ws_id: currentWorkspace.id,
        new_name: workspaceNameInput.trim(),
      });

      if (error) throw error;

      toast.success('Nome do workspace atualizado.');
      setIsEditingWorkspaceName(false);
      await refreshWorkspace();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao atualizar o nome do workspace.'));
    } finally {
      setIsSavingWorkspaceName(false);
    }
  };

  const handleQuickInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteUser(inviteEmail.trim(), inviteRole);
      toast.success('Convite enviado com sucesso.');
      setInviteEmail('');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao enviar convite.'));
    } finally {
      setIsInviting(false);
    }
  };

  const runDeleteStep = async (
    operation: PromiseLike<{ error: { message?: string } | null }>,
    fallbackMessage: string,
    options?: { ignoreMissingTable?: boolean; tableName?: string }
  ) => {
    const { error } = await operation;
    if (error) {
      const errorMessage = error.message || fallbackMessage;
      const missingTableMessage = options?.tableName
        ? `Could not find the table 'public.${options.tableName}' in the schema cache`
        : null;

      if (options?.ignoreMissingTable && missingTableMessage && errorMessage.includes(missingTableMessage)) {
        console.warn(`Skipping optional delete step for missing table: ${options.tableName}`);
        return;
      }

      throw new Error(errorMessage);
    }
  };

  const handleDeleteAllData = async () => {
    if (!user) return;

    if (!canDeleteScopeData) {
      toast.error('Somente o proprietario pode limpar todos os dados do workspace.');
      return;
    }

    if (deleteConfirmation.trim() !== deleteScopeLabel) {
      toast.error(`Digite ${deleteScopeLabel} para confirmar.`);
      return;
    }

    setIsDeletingData(true);

    try {
      if (currentWorkspace?.id) {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id')
          .eq('workspace_id', currentWorkspace.id);

        if (eventsError) throw new Error(eventsError.message || 'Erro ao listar eventos.');

        const eventIds = (eventsData || []).map((event) => event.id);

        if (eventIds.length > 0) {
          await runDeleteStep(
            supabase.from('event_items').delete().in('event_id', eventIds),
            'Erro ao limpar itens de eventos.'
          );
          await runDeleteStep(
            supabase.from('event_participants').delete().in('event_id', eventIds),
            'Erro ao limpar participantes de eventos.'
          );
          await runDeleteStep(
            supabase.from('events').delete().in('id', eventIds),
            'Erro ao limpar eventos.'
          );
        }

        await runDeleteStep(
          supabase.from('purchase_goals').delete().eq('workspace_id', currentWorkspace.id),
          'Erro ao limpar metas.',
          { ignoreMissingTable: true, tableName: 'purchase_goals' }
        );
        await runDeleteStep(
          supabase.from('transactions').delete().eq('workspace_id', currentWorkspace.id),
          'Erro ao limpar transacoes.'
        );
        await runDeleteStep(
          supabase.from('budgets').delete().eq('workspace_id', currentWorkspace.id),
          'Erro ao limpar orcamentos.'
        );
        await runDeleteStep(
          supabase.from('categories').delete().eq('workspace_id', currentWorkspace.id),
          'Erro ao limpar categorias.'
        );
      } else {
        await runDeleteStep(
          supabase
            .from('purchase_goals')
            .delete()
            .eq('user_id', user.id)
            .is('workspace_id', null),
          'Erro ao limpar metas pessoais.',
          { ignoreMissingTable: true, tableName: 'purchase_goals' }
        );
        await runDeleteStep(
          supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id)
            .is('workspace_id', null),
          'Erro ao limpar transacoes pessoais.'
        );
        await runDeleteStep(
          supabase
            .from('budgets')
            .delete()
            .eq('user_id', user.id)
            .is('workspace_id', null),
          'Erro ao limpar orcamentos pessoais.'
        );
        await runDeleteStep(
          supabase
            .from('categories')
            .delete()
            .eq('user_id', user.id)
            .is('workspace_id', null),
          'Erro ao limpar categorias pessoais.'
        );
      }

      await refreshData();
      await refreshWorkspace();

      toast.success(
        currentWorkspace
          ? 'Todos os dados do workspace foram limpos. As categorias padrao serao recriadas automaticamente.'
          : 'Todos os seus dados pessoais foram limpos.'
      );

      setDeleteConfirmation('');
      setShowDeleteDialog(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Nao foi possivel limpar os dados.'));
    } finally {
      setIsDeletingData(false);
    }
  };

  return (
    <AppShell>
      <PageIntro
        eyebrow="Configuracoes"
        title="Conta, equipe e preferencias"
        description="Uma area mais limpa para gerenciar workspace, aparencia e os dados do app sem excesso de informacao."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SurfaceCard className="overflow-hidden p-0">
            <div className="border-b border-border/70 p-5">
              <h3 className="text-lg font-semibold">Workspace e equipe</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste o nome do espaco, convide pessoas e acompanhe o nivel de acesso.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Workspace atual
                    </p>
                    {isEditingWorkspaceName ? (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={workspaceNameInput}
                          onChange={(event) => setWorkspaceNameInput(event.target.value)}
                          className="flex-1 rounded-xl border border-border bg-input px-3 py-3 text-sm text-foreground"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveWorkspaceName}
                          disabled={isSavingWorkspaceName}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-60"
                        >
                          {isSavingWorkspaceName ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setIsEditingWorkspaceName(false)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {currentWorkspace?.name || 'Sem workspace ativo'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Seu nivel de acesso: {stats[2].value}
                        </p>
                      </>
                    )}
                  </div>

                  {canManageWorkspace && !isEditingWorkspaceName ? (
                    <button
                      onClick={handleStartEditWorkspaceName}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">Convite rapido</h4>
                  </div>

                  {canManageWorkspace ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                          placeholder="email@exemplo.com"
                          className="w-full rounded-xl border border-border bg-input py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/70 p-1">
                        <button
                          onClick={() => setInviteRole('viewer')}
                          className={`rounded-lg py-2 text-xs font-medium transition-all ${
                            inviteRole === 'viewer'
                              ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Visualizador
                          </span>
                        </button>
                        <button
                          onClick={() => setInviteRole('editor')}
                          className={`rounded-lg py-2 text-xs font-medium transition-all ${
                            inviteRole === 'editor'
                              ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Edit2 className="h-3 w-3" />
                            Editor
                          </span>
                        </button>
                      </div>

                      <button
                        onClick={handleQuickInvite}
                        disabled={!inviteEmail || isInviting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                      >
                        {isInviting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                        Enviar convite
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Apenas o proprietario pode convidar novos membros.
                    </p>
                  )}
                </div>

                <div className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">Equipe</h4>
                  </div>
                  <p className="text-2xl font-semibold">{members.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    membro{members.length !== 1 ? 's' : ''} com acesso ao workspace atual
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="mt-4 w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                  >
                    Gerenciar equipe
                  </button>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0">
            <div className="border-b border-border/70 p-5">
              <h3 className="text-lg font-semibold">Aparencia e alertas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste o tema da interface e o comportamento dos lembretes.
              </p>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Tema
                </p>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/70 p-1">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`rounded-xl py-3 text-sm font-medium transition-all ${
                        theme === option.id
                          ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-border/70 bg-background/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Lembretes
                    </p>
                    <p className="mt-2 font-medium text-foreground">Notificacoes de pendencias</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ative ou pause alertas para acompanhar movimentacoes abertas.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      updateSettings({
                        notificationsEnabled: !settings.notificationsEnabled,
                      })
                    }
                    className={`relative h-5 w-10 rounded-full border transition-all ${
                      settings.notificationsEnabled
                        ? 'border-primary/30 bg-primary/80'
                        : 'border-border/70 bg-muted/70'
                    }`}
                  >
                    <div
                      className={`absolute top-[2px] h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-all ${
                        settings.notificationsEnabled ? 'left-[20px]' : 'left-[2px]'
                      }`}
                    />
                  </button>
                </div>

                {settings.notificationsEnabled && notificationPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={requestNotificationPermission}
                    className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={notificationPermission === 'unsupported'}
                  >
                    {notificationPermission === 'unsupported'
                      ? 'Notificacoes indisponiveis neste navegador'
                      : 'Permitir notificacoes neste aparelho'}
                  </button>
                ) : null}
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="overflow-hidden p-0">
            <div className="border-b border-border/70 p-5">
              <h3 className="text-lg font-semibold">Dados</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Exporte, importe e limpe dados com mais previsibilidade.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {[
                {
                  label: 'Exportar JSON',
                  description: 'Baixa um snapshot completo do seu financeiro.',
                  icon: Download,
                  onClick: handleExport,
                },
                {
                  label: 'Exportar CSV',
                  description: 'Leva os lancamentos para planilha em formato tabular.',
                  icon: Download,
                  onClick: handleExportCSV,
                },
                {
                  label: 'Baixar modelo',
                  description: 'Arquivo base para importar seus dados com menos erro.',
                  icon: FileSpreadsheet,
                  onClick: handleDownloadTemplate,
                },
                {
                  label: 'Importar dados',
                  description: 'Traz um arquivo JSON ja estruturado para dentro do app.',
                  icon: Upload,
                  onClick: () => fileInputRef.current?.click(),
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex w-full items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{action.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <div className="rounded-[24px] border border-expense/20 bg-expense/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/70 text-expense">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-expense">Exclusao em massa</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Remove transacoes, categorias, orcamentos, metas e eventos do escopo atual.
                      {currentWorkspace
                        ? ' No workspace, isso afeta todos os membros.'
                        : ' No modo pessoal, afeta apenas seus dados.'}
                    </p>
                    {!canDeleteScopeData ? (
                      <p className="mt-3 text-sm text-expense">
                        Somente o proprietario pode executar essa limpeza no workspace.
                      </p>
                    ) : (
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-expense/30 bg-background/80 px-4 py-3 text-sm font-semibold text-expense transition-colors hover:bg-background"
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpar todos os dados
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0">
            <div className="border-b border-border/70 p-5">
              <h3 className="text-lg font-semibold">Minha conta</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Perfil, seguranca basica e saida da sessao.
              </p>
            </div>

            <div className="space-y-3 p-5">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-border/70 bg-background/60 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {profileData.displayName || 'Sem nome'}
                    </p>
                    <p className="max-w-[240px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sincronizacao protegida</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Seus dados ficam vinculados ao usuario autenticado e ao workspace ativo.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-expense/20 bg-expense/10 p-4 text-sm font-semibold text-expense disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sair da conta
              </button>
            </div>
          </SurfaceCard>
        </div>
      </div>

      <BottomNav />

      <WorkspaceInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={user?.id}
        initialName={profileData.displayName}
        initialEmail={profileData.email}
        isOwnProfile
        onSaved={async () => {
          await loadProfile();
          await refreshWorkspace();
        }}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir dados em massa</DialogTitle>
            <DialogDescription>
              Essa acao limpa o escopo atual de uma vez.
              {currentWorkspace
                ? ` Para confirmar, digite exatamente ${deleteScopeLabel}.`
                : ' Para confirmar, digite exatamente EXCLUIR.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-expense/20 bg-expense/10 p-4 text-sm text-muted-foreground">
              {currentWorkspace
                ? 'O workspace mantera a estrutura e os membros, mas perdera transacoes, categorias, orcamentos, metas e eventos.'
                : 'Seu perfil sera mantido, mas os dados financeiros pessoais serao apagados.'}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Confirmacao
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder={`Digite ${deleteScopeLabel}`}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => {
                setDeleteConfirmation('');
                setShowDeleteDialog(false);
              }}
              className="rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAllData}
              disabled={isDeletingData || deleteConfirmation.trim() !== deleteScopeLabel}
              className="rounded-xl bg-expense px-4 py-3 text-sm font-semibold text-expense-foreground disabled:opacity-50"
            >
              {isDeletingData ? 'Limpando...' : 'Excluir tudo'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Settings;
