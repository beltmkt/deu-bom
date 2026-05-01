const DEFAULT_PUBLIC_APP_URL = 'https://deu-bom-financas-sem-erro.vercel.app';

const normalizeOrigin = (value?: string | null) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

export const getPublicAppUrl = () => {
  const configuredUrl = normalizeOrigin(import.meta.env.VITE_PUBLIC_APP_URL);
  if (configuredUrl) return configuredUrl;

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocal) return currentOrigin;
  }

  return DEFAULT_PUBLIC_APP_URL;
};

export const buildAppUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getPublicAppUrl()}${normalizedPath}`;
};
