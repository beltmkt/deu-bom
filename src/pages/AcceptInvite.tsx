import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Loader2, Check, X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<{
    email: string;
    workspaceName: string;
    role: string;
    workspaceId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Token de convite inválido');
        setLoading(false);
        return;
      }

      const { data: inv, error: invError } = await supabase
        .from('workspace_invitations')
        .select('email, role, workspace_id, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (invError || !inv) {
        setError('Convite não encontrado ou expirado');
        setLoading(false);
        return;
      }

      // Check if expired
      if (new Date(inv.expires_at) < new Date()) {
        setError('Este convite expirou');
        setLoading(false);
        return;
      }

      // Get workspace name
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', inv.workspace_id)
        .maybeSingle();

      setInvitation({
        email: inv.email,
        workspaceName: workspace?.name || 'Espaço',
        role: inv.role,
        workspaceId: inv.workspace_id,
      });
      setEmail(inv.email);
      setLoading(false);
    };

    fetchInvitation();
  }, [token]);

  // Auto-accept if user is already logged in
  useEffect(() => {
    if (user && invitation) {
      handleAcceptInvite();
    }
  }, [user, invitation]);

  const handleAcceptInvite = async () => {
    if (!invitation || !token) return;

    setAccepting(true);
    try {
      // Add user as workspace member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspaceId,
          user_id: user?.id,
          role: invitation.role as 'editor' | 'viewer',
          accepted_at: new Date().toISOString(),
        });

      if (memberError) {
        if (memberError.code === '23505') {
          toast.info('Você já é membro deste espaço');
        } else {
          throw memberError;
        }
      }

      // Delete the invitation
      await supabase
        .from('workspace_invitations')
        .delete()
        .eq('token', token);

      // Update profile to use this workspace
      if (user) {
        await supabase
          .from('profiles')
          .update({ current_workspace_id: invitation.workspaceId })
          .eq('id', user.id);
      }

      toast.success('Convite aceito com sucesso!');
      navigate('/');
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      toast.error(err.message || 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Conta criada! Verifique seu email se necessário.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'editor': return 'Editor';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-expense" />
          </div>
          <h1 className="text-xl font-bold mb-2">Ops!</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Ir para Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Aceitando convite...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full"
      >
        {/* Invitation Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Convite para Colaborar</h1>
          <p className="text-muted-foreground">
            Você foi convidado para participar de <strong className="text-foreground">{invitation?.workspaceName}</strong> como{' '}
            <strong className="text-primary">{getRoleLabel(invitation?.role || '')}</strong>
          </p>
        </div>

        {/* Auth Form */}
        {!user && (
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  isLogin ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  !isLogin ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-expense/10 border border-expense/20 rounded-xl">
                <p className="text-sm text-expense">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isLogin ? 'Entrar e Aceitar Convite' : 'Criar Conta e Aceitar'}
                </>
              )}
            </button>
          </form>
        )}

        {user && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-income/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-income" />
            </div>
            <p className="text-muted-foreground">Processando seu convite...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
