import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Eye, EyeOff, KeyRound, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        if (active) {
          setHasSession(true);
          setChecking(false);
        }
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (!active) return;

        if (event === 'PASSWORD_RECOVERY' && nextSession) {
          setHasSession(true);
        }

        setChecking(false);
      });

      if (active) {
        setChecking(false);
      }

      return () => subscription.unsubscribe();
    };

    const cleanupPromise = checkSession();

    return () => {
      active = false;
      cleanupPromise?.then((cleanup) => cleanup?.());
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      toast.success('Senha alterada com sucesso.');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      setError(getErrorMessage(error, 'Erro ao redefinir senha'));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <KeyRound className="h-8 w-8 text-warning" />
          </div>
          <h1 className="mb-2 text-xl font-bold">Link invalido</h1>
          <p className="mb-6 text-muted-foreground">
            Este link de recuperacao e invalido ou expirou. Solicite um novo email de recuperacao.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            Voltar para login
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-income/10">
            <Check className="h-8 w-8 text-income" />
          </div>
          <h1 className="mb-2 text-xl font-bold">Senha alterada</h1>
          <p className="mb-6 text-muted-foreground">
            Sua senha foi redefinida com sucesso. Voce sera redirecionado em instantes.
          </p>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
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
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-xl font-bold">Redefinir senha</h1>
          <p className="text-muted-foreground">Digite sua nova senha abaixo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nova senha"
              className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground"
              required
              minLength={6}
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

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmar nova senha"
              className="w-full rounded-xl border border-border bg-input py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-expense/20 bg-expense/10 p-3">
              <p className="text-sm text-expense">{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5" />
                Redefinir senha
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          A senha deve ter pelo menos 6 caracteres.
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
