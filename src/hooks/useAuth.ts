import { useState, useEffect, useCallback } from 'react';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuth() {
  const [state, setState] = useState<AuthState>('loading');

  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setState(data.authenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        // If auth endpoint fails (e.g. no password configured), allow access
        setState('authenticated');
      });
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setState('authenticated');
      return true;
    }
    return false;
  }, []);

  return { state, login };
}
