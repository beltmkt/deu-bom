import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError('Nao foi possivel confirmar este email. Solicite um novo link.');
          return;
        }
      }

      navigate('/', { replace: true });
    };

    confirmEmail();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-sm text-center">
        {error ? (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-expense/10 text-expense">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold">Link de confirmacao invalido</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
            <Link
              to="/auth"
              className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              Voltar ao login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="mt-5 text-xl font-bold">Confirmando seu email...</h1>
          </>
        )}
      </section>
    </main>
  );
};

export default AuthConfirm;
