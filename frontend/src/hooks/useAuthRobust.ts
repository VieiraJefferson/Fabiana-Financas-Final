import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  image?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuthRobust = () => {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  // Função para verificar autenticação no backend
  const checkBackendAuth = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }

      if (response.status === 401) {
        // Token expirado, tentar renovar
        const refreshResponse = await fetch('/api/users/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshResponse.ok) {
          // Token renovado, tentar novamente
          const retryResponse = await fetch('/api/users/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return data.user;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao verificar autenticação no backend:', error);
      return null;
    }
  }, []);

  // Função para fazer logout
  const logout = useCallback(async () => {
    try {
      // Logout no backend
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro no logout do backend:', error);
    } finally {
      // Logout no NextAuth
      await signOut({ callbackUrl: '/login' });
    }
  }, []);

  // Função para fazer logout de todas as sessões
  const logoutAll = useCallback(async () => {
    try {
      await fetch('/api/users/logout-all', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro no logout-all do backend:', error);
    } finally {
      await signOut({ callbackUrl: '/login' });
    }
  }, []);

  // Função para fazer requisições autenticadas
  const makeAuthenticatedRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    let response = await fetch(url, defaultOptions);

    // Se receber 401, tentar renovar o token
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch('/api/users/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshResponse.ok) {
          // Token renovado, repetir a requisição original
          response = await fetch(url, defaultOptions);
        }
      } catch (error) {
        console.error('Erro ao renovar token:', error);
      }
    }

    return response;
  }, []);

  // Efeito para verificar autenticação quando a sessão muda
  useEffect(() => {
    const verifyAuth = async () => {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        if (status === 'loading') {
          return; // Aguardar NextAuth carregar
        }

        if (status === 'unauthenticated') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null
          });
          return;
        }

        // Verificar autenticação no backend
        const user = await checkBackendAuth();

        if (user) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
        } else {
          // Usuário não autenticado no backend
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Sessão inválida'
          });
          
          // Fazer logout automático
          await signOut({ callbackUrl: '/login' });
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Erro ao verificar autenticação'
        });
      }
    };

    verifyAuth();
  }, [status, checkBackendAuth]);

  // Função para renovar tokens manualmente
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Verificar autenticação novamente
        const user = await checkBackendAuth();
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            error: null
          }));
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Erro ao renovar tokens:', error);
      return false;
    }
  }, [checkBackendAuth]);

  // Função para obter headers de autenticação
  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
    };
  }, []);

  return {
    ...authState,
    logout,
    logoutAll,
    makeAuthenticatedRequest,
    refreshTokens,
    getAuthHeaders,
    session,
    status,
  };
};
