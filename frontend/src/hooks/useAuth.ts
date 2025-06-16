import { useSession } from "next-auth/react";
import { useCallback } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const getAuthToken = useCallback(() => {
    console.log('=== DEBUG useAuth.getAuthToken ===');
    console.log('Session:', session);
    console.log('Session accessToken:', session?.accessToken);
    
    if (!session?.accessToken) {
      console.log('Token não encontrado na sessão');
      // Retornar null ou uma string vazia em vez de lançar um erro aqui
      // para permitir que a UI reaja de forma mais graciosa.
      return null;
    }
    
    console.log('Token encontrado:', session.accessToken.substring(0, 20) + '...');
    // Usar o JWT token real do backend
    return session.accessToken;
  }, [session]);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      // Se não houver token, não podemos formar os cabeçalhos.
      // Retornar null para que a lógica de chamada possa lidar com isso.
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [getAuthToken]);

  return {
    session,
    status,
    isAuthenticated: !!session?.user,
    getAuthToken,
    getAuthHeaders,
  };
}; 