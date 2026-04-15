import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  Download,
  Edit,
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
import { useFinanceStore, useSettings } from '@/stores/financeStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Settings: React.FC = () => {
  const settings = useSettings();
  const { exportData, importData, updateSettings, initialize, initialized } = useFinanceStore();
  const { user, signOut } = useAuth();
  const { currentWorkspace, members, userRole, inviteUser, refreshWorkspace } = useWorkspace();
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

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  useEffect(() => {
    const loadProfile = async () => {
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
    };

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch {
      toast.error('Erro ao fazer logout');
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
    toast.success('Dados exportados com sucesso!');
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
    toast.success('Dados exportados em CSV!');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const content = loadEvent.target?.result as string;
      const success = await importData(content);
      if (success) {
        toast.success('Dados importados com sucesso!');
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
    toast.success('Modelo baixado! Preencha e importe.');
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'owner':
        return 'Proprietario';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return 'Usuario';
    }
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

      toast.success('Nome do espaco atualizado!');
      setIsEditingWorkspaceName(false);
      await refreshWorkspace();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar nome');
    } finally {
      setIsSavingWorkspaceName(false);
    }
  };

  const handleQuickInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteUser(inviteEmail.trim(), inviteRole);
      toast.success('Convite enviado!');
      setInviteEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar convite');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <AppShell>
      <PageIntro
        eyebrow="Configurações"
        title="Conta, equipe e preferências"
        description="Central de administração do ambiente, com foco em clareza, segurança e manutenção do dia a dia."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SurfaceCard className="overflow-hidden p-0">
            <h3 className="border-b border-border p-4 font-semibold">Equipe</h3>
            <div className="space-y-4 p-4">
              <div className="rounded-2xl bg-muted p-4">
                <p className="mb-1 text-sm text-muted-foreground">Espaço atual</p>
                {isEditingWorkspaceName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={workspaceNameInput}
                      onChange={(event) => setWorkspaceNameInput(event.target.value)}
                      className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-foreground"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveWorkspaceName}
                      disabled={isSavingWorkspaceName}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
                    >
                      {isSavingWorkspaceName ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                      ) : (
                        <Check className="h-5 w-5 text-primary-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditingWorkspaceName(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-foreground/20"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{currentWorkspace?.name || 'Carregando...'}</p>
                    {userRole === 'owner' ? (
                      <button
                        onClick={handleStartEditWorkspaceName}
                        className="rounded-lg p-2 transition-colors hover:bg-background/50"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ) : null}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Seu nível de acesso:{' '}
                  <span className="font-medium text-primary">{getRoleLabel(userRole)}</span>
                </p>
              </div>

              {userRole === 'owner' ? (
                <div className="space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <h4 className="flex items-center gap-2 font-medium">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Convidar membro
                  </h4>
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
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                    <button
                      onClick={() => setInviteRole('viewer')}
                      className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-all ${
                        inviteRole === 'viewer'
                          ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      Visualizador
                    </button>
                    <button
                      onClick={() => setInviteRole('editor')}
                      className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-all ${
                        inviteRole === 'editor'
                          ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Edit className="h-3 w-3" />
                      Editor
                    </button>
                  </div>
                  <button
                    onClick={handleQuickInvite}
                    disabled={!inviteEmail || isInviting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Enviar convite
                  </button>
                </div>
              ) : null}

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-muted p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {userRole === 'owner' ? 'Gerenciar equipe' : 'Ver membros'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <div className="rounded-2xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  {userRole === 'owner'
                    ? 'Como proprietário, você tem acesso total ao ambiente e pode definir permissões da equipe.'
                    : `Você participa deste espaço como ${getRoleLabel(userRole).toLowerCase()}.`}
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0">
            <h3 className="border-b border-border p-4 font-semibold">Aparência</h3>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Escuro
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                    theme === 'system'
                      ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  Sistema
                </button>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0">
            <h3 className="border-b border-border p-4 font-semibold">Notificações</h3>
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Lembretes</p>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas sobre transações e pendências
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
                  }
                  className={`relative h-7 w-12 rounded-full transition-all ${
                    settings.notificationsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-md transition-all ${
                      settings.notificationsEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="w-full">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Panorama
                </p>
                <h3 className="mt-1 text-lg font-semibold">Status do ambiente</h3>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Usuário</p>
                    <p className="mt-1 font-medium">
                      {profileData.displayName || user?.email || 'Sem identificação'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Workspace</p>
                    <p className="mt-1 font-medium">
                      {currentWorkspace?.name || 'Sem workspace ativo'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Perfil de acesso</p>
                    <p className="mt-1 font-medium">{getRoleLabel(userRole)}</p>
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0">
            <h3 className="border-b border-border p-4 font-semibold">Dados</h3>
            <div className="space-y-3 p-4">
              <button
                onClick={handleExport}
                className="flex w-full items-center justify-between rounded-2xl bg-muted p-4"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span>Exportar JSON</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={handleExportCSV}
                className="flex w-full items-center justify-between rounded-2xl bg-muted p-4"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span>Exportar CSV</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={handleDownloadTemplate}
                className="flex w-full items-center justify-between rounded-2xl border border-primary/10 bg-primary/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <span className="block">Baixar modelo de planilha</span>
                    <span className="text-xs text-muted-foreground">Para importar seus dados</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-between rounded-2xl bg-muted p-4"
              >
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span>Importar dados</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0">
            <h3 className="border-b border-border p-4 font-semibold">Minha conta</h3>
            <div className="space-y-3 p-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-muted p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{profileData.displayName || 'Sem nome'}</p>
                    <p className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Edit2 className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-between rounded-2xl border border-expense/20 bg-expense/10 p-4 text-expense"
              >
                <div className="flex items-center gap-3">
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                  <span>Sair da conta</span>
                </div>
              </button>
            </div>
          </SurfaceCard>

          <section className="py-2 text-center">
            <p className="text-sm text-muted-foreground">DEU BOM!! v1.0</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Dados sincronizados com a nuvem
            </p>
          </section>
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
          if (user) {
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
          }
          refreshWorkspace();
        }}
      />
    </AppShell>
  );
};

export default Settings;
