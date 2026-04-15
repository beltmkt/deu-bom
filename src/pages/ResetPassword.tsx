import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, Check, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
    // Check if user has a valid session from the recovery link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setHasSession(true);
      } else {
        // Listen for auth state changes (when user clicks recovery link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
              setHasSession(true);
            }
          }
        );

        // Cleanup
        setTimeout(() => {
          subscription.unsubscribe();
        }, 5000);
      }
      
      setChecking(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      toast.success('Senha alterada com sucesso!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-xl font-bold mb-2">Link Inválido</h1>
          <p className="text-muted-foreground mb-6">
            Este link de recuperação é inválido ou expirou. Por favor, solicite um novo link de recuperação.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Voltar para Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-income/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-income" />
          </div>
          <h1 className="text-xl font-bold mb-2">Senha Alterada!</h1>
          <p className="text-muted-foreground mb-6">
            Sua senha foi redefinida com sucesso. Você será redirecionado...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Redefinir Senha</h1>
          <p className="text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
              required
              minLength={6}
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

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nova senha"
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-expense/10 border border-expense/20 rounded-xl">
              <p className="text-sm text-expense">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Redefinir Senha
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          A senha deve ter pelo menos 6 caracteres
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
