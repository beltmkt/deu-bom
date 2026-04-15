import React, { useRef, useEffect, useState } from 'react';
import {
  Download,
  Upload,
  Bell,
  ChevronRight,
  LogOut,
  Loader2,
  Users,
  Edit2,
  Check,
  X,
  UserPlus,
  Mail,
  Eye,
  Edit,
  User,
  FileSpreadsheet,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useFinanceStore, useSettings, useFinanceLoading } from '@/stores/financeStore';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { WorkspaceInviteModal } from '@/components/WorkspaceInviteModal';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { supabase } from '@/integrations/supabase/client';

const Settings: React.FC = () => {
  const settings = useSettings();
  const loading = useFinanceLoading();
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
  
  // Profile data
  const [profileData, setProfileData] = useState<{ displayName: string; email: string }>({ 
    displayName: '', 
    email: '' 
  });
  
  // Quick invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  // Load profile data
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const handleExportCSV = () => {
    const state = useFinanceStore.getState();
    const categories = state.categories;
    
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'];
    const rows = state.transactions.map((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      return [
        t.date,
        t.title,
        category?.name || '',
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2).replace('.', ','),
        t.status === 'completed' ? 'Concluído' : 'Pendente',
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados em CSV!');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const success = await importData(content);
      if (success) {
        toast.success('Dados importados com sucesso!');
      } else {
        toast.error('Erro ao importar dados. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'];
    const exampleRows = [
      ['2025-01-15', 'Salário', 'Salário', 'Receita', '5000,00', 'Concluído'],
      ['2025-01-16', 'Supermercado', 'Alimentação', 'Despesa', '350,50', 'Concluído'],
      ['2025-01-20', 'Conta de Luz', 'Contas', 'Despesa', '180,00', 'Pendente'],
      ['2025-01-25', 'Freelance', 'Renda Extra', 'Receita', '1200,00', 'Pendente'],
    ];

    const csv = [headers, ...exampleRows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-importacao.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Modelo baixado! Preencha e importe.');
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'owner': return 'Proprietário';
      case 'editor': return 'Editor';
      case 'viewer': return 'Visualizador';
      default: return 'Usuário';
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
        new_name: workspaceNameInput.trim()
      });
      
      if (error) throw error;
      
      toast.success('Nome do espaço atualizado!');
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 px-4 py-4 border-b border-border/50">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Team/Workspace Section */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-semibold p-4 border-b border-border">Equipe</h3>
          
          <div className="p-4 space-y-4">
            {/* Current Workspace Info with Edit */}
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Espaço atual</p>
              {isEditingWorkspaceName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={workspaceNameInput}
                    onChange={(e) => setWorkspaceNameInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-foreground"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveWorkspaceName}
                    disabled={isSavingWorkspaceName}
                    className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"
                  >
                    {isSavingWorkspaceName ? (
                      <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                    ) : (
                      <Check className="w-5 h-5 text-primary-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditingWorkspaceName(false)}
                    className="w-10 h-10 rounded-lg bg-muted-foreground/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-medium">{currentWorkspace?.name || 'Carregando...'}</p>
                  {userRole === 'owner' && (
                    <button
                      onClick={handleStartEditWorkspaceName}
                      className="p-2 rounded-lg hover:bg-background/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Seu nível de acesso: <span className="font-medium text-primary">{getRoleLabel(userRole)}</span>
              </p>
            </div>

            {/* Quick Invite Form - Only for owners */}
            {userRole === 'owner' && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  Convidar Membro
                </h4>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                  <button
                    onClick={() => setInviteRole('viewer')}
                    className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      inviteRole === 'viewer'
                        ? 'bg-card shadow-md text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Visualizador
                  </button>
                  <button
                    onClick={() => setInviteRole('editor')}
                    className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      inviteRole === 'editor'
                        ? 'bg-card shadow-md text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Edit className="w-3 h-3" />
                    Editor
                  </button>
                </div>
                <button
                  onClick={handleQuickInvite}
                  disabled={!inviteEmail || isInviting}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isInviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Enviar Convite
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Members count */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
                  <p className="text-sm text-muted-foreground">
                    {userRole === 'owner' ? 'Gerenciar equipe' : 'Ver membros'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Info about access */}
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">
                {userRole === 'owner' ? (
                  <>Como proprietário, você tem <strong>acesso total</strong> a todas as funcionalidades. Você pode convidar membros e definir suas permissões.</>
                ) : (
                  <>Você foi convidado para este espaço como <strong>{getRoleLabel(userRole)}</strong>. Entre em contato com o proprietário para alterar permissões.</>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-semibold p-4 border-b border-border">Aparência</h3>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setTheme('light')}
                className={`py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'light' ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Sun className="w-4 h-4" />
                Claro
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Moon className="w-4 h-4" />
                Escuro
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'system' ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Sistema
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-semibold p-4 border-b border-border">Notificações</h3>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Lembretes</p>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas de transações
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
                }
                className={`
                  w-12 h-7 rounded-full transition-all relative
                  ${settings.notificationsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-5 h-5 rounded-full bg-card shadow-md transition-all
                    ${settings.notificationsEnabled ? 'left-6' : 'left-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-semibold p-4 border-b border-border">Dados</h3>
          
          <div className="p-4 space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <span>Exportar JSON</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <span>Exportar CSV</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Template download */}
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="block">Baixar Modelo de Planilha</span>
                  <span className="text-xs text-muted-foreground">Para importar seus dados</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span>Importar Dados</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </section>

        {/* Account Section */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-semibold p-4 border-b border-border">Minha Conta</h3>
          
          <div className="p-4 space-y-3">
            {/* Profile info */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{profileData.displayName || 'Sem nome'}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Edit2 className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between p-4 bg-expense/10 text-expense rounded-xl border border-expense/20"
            >
              <div className="flex items-center gap-3">
                {isLoggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span>Sair da Conta</span>
              </div>
            </button>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center py-4">
          <p className="text-sm text-muted-foreground">DEU BOM!! v1.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Dados sincronizados com a nuvem
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Workspace Invite Modal */}
      <WorkspaceInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={user?.id}
        initialName={profileData.displayName}
        initialEmail={profileData.email}
        isOwnProfile={true}
        onSaved={async () => {
          // Reload profile data
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
    </div>
  );
};


export default Settings;
