"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout completo...');
      
      // 1. Limpar todos os storages
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpar cookies do NextAuth
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          if (name.includes('next-auth') || name.includes('session')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }
      
      // 2. Fazer logout do NextAuth
      await signOut({ 
        redirect: false // Não redirecionar automaticamente
      });
      
      console.log('✅ Logout realizado com sucesso');
      
      // 3. Forçar navegação para login
      router.push('/login');
      
      // 4. Forçar reload da página para limpar qualquer estado residual
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Fallback: forçar redirecionamento direto
      window.location.href = '/login';
    }
  };

  return { logout };
}; 