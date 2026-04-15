import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'A senha deve ter pelo menos 6 caracteres');

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (!isForgotPassword) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
          setIsForgotPassword(false);
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Login realizado com sucesso!');
        }
      } else {
        const { error } = await signUp(email, password, displayName, workspaceName || undefined);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado. Você pode ser convidado por outro usuário.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Conta criada com sucesso! Você tem acesso total à ferramenta.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 pt-12 pb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-lg shadow-primary/30"
        >
          <Wallet className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6"
        >
          <h1 className="text-3xl font-bold">DEU BOM!!</h1>
          <p className="text-primary mt-1 text-lg font-semibold">
            FINANÇAS SEM ERRO
          </p>
        </motion.div>
      </header>

      {/* Form */}
      <main className="flex-1 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-md mx-auto"
        >
          {isForgotPassword ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Recuperar Senha</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Digite seu email para receber o link de recuperação
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="seu@email.com"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.email ? 'border-expense' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-expense text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Enviar Link de Recuperação
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar para o login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex bg-muted rounded-xl p-1 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isLogin
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !isLogin
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium mb-2">Seu Nome</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Como quer ser chamado?"
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium mb-2">Nome do Espaço</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          placeholder="Ex: Contas da Família, Minha Casa..."
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você terá acesso total e poderá convidar outros usuários
                      </p>
                    </motion.div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="seu@email.com"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.email ? 'border-expense' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-expense text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.password ? 'border-expense' : 'border-border'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-expense text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
        
        {!isLogin && !isForgotPassword && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-4 max-w-md mx-auto"
          >
            Ao criar uma conta, você se torna proprietário com acesso total. 
            Emails já cadastrados não podem criar novas contas, mas podem ser convidados.
          </motion.p>
        )}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 px-6 pb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Seus dados financeiros protegidos e sincronizados
        </p>
      </footer>
    </div>
  );
};

export default Auth;