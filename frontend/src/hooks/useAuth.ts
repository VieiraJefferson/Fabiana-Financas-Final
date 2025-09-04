import { useSession } from "next-auth/react";
import { useCallback } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const getAuthToken = useCallback(async () => {
    console.log('=== DEBUG useAuth.getAuthToken ===');
    console.log('Session:', session);
    
    // Como agora usamos cookies httpOnly, não precisamos mais gerenciar tokens manualmente
    // O backend gerencia automaticamente através dos cookies
    console.log('✅ Usando sistema de cookies httpOnly - tokens gerenciados automaticamente');
    return 'cookie-based-auth';
  }, [session]);

  const getAuthHeaders = useCallback(() => {
    // Para o novo sistema, não precisamos mais enviar Authorization header
    // O backend lê automaticamente dos cookies
    return {
      'Content-Type': 'application/json',
    };
  }, []);

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const defaultOptions: RequestInit = {
      credentials: 'include', // Importante para enviar cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // Se o token expirou, tentar renovar automaticamente
      if (response.status === 401) {
        console.log('🔄 Token expirado, tentando renovar...');
        
        try {
          const refreshResponse = await fetch('/api/users/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (refreshResponse.ok) {
            console.log('✅ Token renovado, repetindo requisição original...');
            // Repetir a requisição original com o novo token
            return fetch(url, defaultOptions);
          }
        } catch (refreshError) {
          console.error('❌ Erro ao renovar token:', refreshError);
        }
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro na requisição autenticada:', error);
      throw error;
    }
  }, []);

  return {
    session,
    status,
    isAuthenticated: !!session?.user,
    getAuthToken,
    getAuthHeaders,
    makeAuthenticatedRequest,
  };
}; 