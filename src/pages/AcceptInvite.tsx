import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildAppUrl } from '@/utils/appUrl';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, loading: authStateLoading } = useAuth();

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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const acceptanceStartedRef = useRef(false);

  const getInviteErrorMessage = (message?: string) => {
    if (!message) return 'Erro ao aceitar convite';
    if (message.includes('AUTH_REQUIRED')) return 'Entre na sua conta para aceitar o convite.';
    if (message.includes('INVITE_NOT_FOUND')) return 'Convite nao encontrado ou ja utilizado.';
    if (message.includes('INVITE_EXPIRED')) return 'Este convite expirou.';
    if (message.includes('INVITE_EMAIL_MISMATCH')) {
      return 'Este convite pertence a outro email. Entre com o email convidado.';
    }
    return getErrorMessage({ message }, 'Erro ao aceitar convite');
  };

  const fetchInvitation = useCallback(async () => {
    if (!token) {
      setError('Token de convite invalido');
      setLoading(false);
      return;
    }

    const { data, error: invitationError } = await supabase.rpc(
      'get_workspace_invitation_by_token',
      { invite_token: token }
    );
    const invitationData = data?.[0];

    if (invitationError || !invitationData) {
      setError('Convite nao encontrado ou expirado');
      setLoading(false);
      return;
    }

    if (new Date(invitationData.expires_at) < new Date()) {
      setError('Este convite expirou');
      setLoading(false);
      return;
    }

    setInvitation({
      email: invitationData.email,
      workspaceName: invitationData.workspace_name || 'Espaco',
      role: invitationData.role,
      workspaceId: invitationData.workspace_id,
    });
    setEmail(invitationData.email);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  const handleAcceptInvite = useCallback(async () => {
    if (!invitation || !token || !user || accepting || acceptanceStartedRef.current) return;

    acceptanceStartedRef.current = true;
    setAccepting(true);
    setAcceptError(null);

    try {
      const { error: acceptError } = await supabase.rpc('accept_workspace_invitation', {
        invite_token: token,
      });

      if (acceptError) {
        throw acceptError;
      }

      toast.success('Convite aceito com sucesso.');
      navigate('/');
    } catch (error: unknown) {
      console.error('Error accepting invite:', error);
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message || '')
          : '';
      const friendlyMessage = getInviteErrorMessage(message);
      setAcceptError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setAccepting(false);
    }
  }, [accepting, invitation, navigate, token, user]);

  useEffect(() => {
    if (!authStateLoading && user && invitation && !acceptError) {
      handleAcceptInvite();
    }
  }, [acceptError, authStateLoading, handleAcceptInvite, invitation, user]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
      } else {
        const nextPath = `/accept-invite?token=${encodeURIComponent(token || '')}`;
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildAppUrl(`/auth/confirm?next=${encodeURIComponent(nextPath)}`),
            data: {
              display_name: displayName || email.split('@')[0],
              workspace_name: 'Meu Espaco',
            },
          },
        });
        if (signUpError) throw signUpError;
        toast.success('Conta criada. Confira seu email se necessario e volte por este convite.');
      }
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error, 'Erro na autenticacao'));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-expense/10">
            <X className="h-8 w-8 text-expense" />
          </div>
          <h1 className="mb-2 text-xl font-bold">Ops</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            Ir para login
          </button>
        </motion.div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Aceitando convite...</p>
        </motion.div>
      </div>
    );
  }

  if (acceptError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-expense/10">
            <X className="h-8 w-8 text-expense" />
          </div>
          <h1 className="mb-2 text-xl font-bold">Nao foi possivel aceitar</h1>
          <p className="mb-6 text-muted-foreground">{acceptError}</p>
          <div className="grid gap-3">
            <button
              onClick={() => {
                acceptanceStartedRef.current = false;
                void handleAcceptInvite();
              }}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="w-full rounded-xl border border-border py-3 font-semibold text-foreground"
            >
              Entrar com outro email
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-xl font-bold">Convite para colaborar</h1>
          <p className="text-muted-foreground">
            Voce foi convidado para participar de{' '}
            <strong className="text-foreground">{invitation?.workspaceName}</strong> como{' '}
            <strong className="text-primary">{getRoleLabel(invitation?.role || '')}</strong>
          </p>
        </div>

        {!user ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-lg py-3 text-sm font-medium transition-all ${
                  isLogin ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-lg py-3 text-sm font-medium transition-all ${
                  !isLogin ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground'
                }`}
              >
                Criar conta
              </button>
            </div>

            {!isLogin ? (
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground"
                  required={!isLogin}
                />
              </div>
            ) : null}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Senha"
                className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {authError ? (
              <div className="rounded-xl border border-expense/20 bg-expense/10 p-3">
                <p className="text-sm text-expense">{authError}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={authSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {authSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  {isLogin ? 'Entrar e aceitar convite' : 'Criar conta e aceitar'}
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-income/10">
              <Check className="h-6 w-6 text-income" />
            </div>
            <p className="text-muted-foreground">Processando seu convite...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
