import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const getParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    return {
      code: searchParams.get('code') || hashParams.get('code'),
      tokenHash: searchParams.get('token_hash') || hashParams.get('token_hash'),
      type: searchParams.get('type') || hashParams.get('type'),
      accessToken: hashParams.get('access_token'),
      refreshToken: hashParams.get('refresh_token'),
      next: searchParams.get('next') || hashParams.get('next'),
      urlError:
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error'),
    };
  };

  useEffect(() => {
    const confirmEmail = async () => {
      const { code, tokenHash, type, accessToken, refreshToken, next, urlError } = getParams();
      const nextPath = next?.startsWith('/') ? next : '/';

      if (urlError) {
        setError(decodeURIComponent(urlError.replace(/\+/g, ' ')));
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError('Nao foi possivel confirmar este email. Solicite um novo link.');
          return;
        }
      }

      if (!code && tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === 'recovery' ? 'recovery' : 'signup',
        });

        if (verifyError) {
          setError('Nao foi possivel confirmar este email. Solicite um novo link.');
          return;
        }
      }

      if (!code && !tokenHash && accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError('Confirmacao recebida, mas a sessao nao foi iniciada. Entre com seu email e senha.');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setError('Confirmacao recebida, mas a sessao nao foi iniciada. Entre com seu email e senha.');
        return;
      }

      setConfirmed(true);
      window.setTimeout(() => navigate(nextPath, { replace: true }), 1200);
    };

    confirmEmail();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-sm text-center">
        {error ? (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-expense/10 text-expense">
              <X className="h-7 w-7" />
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
        ) : confirmed ? (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-income/10 text-income">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold">Email confirmado</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sua conta foi vinculada ao Supabase. Vamos abrir o app agora.
            </p>
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
