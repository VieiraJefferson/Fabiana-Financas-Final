import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseAuthRedirectOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  adminRedirectTo?: string;
  userRedirectTo?: string;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    requireAuth = false,
    requireAdmin = false,
    redirectTo = "/login",
    adminRedirectTo = "/admin",
    userRedirectTo = "/dashboard"
  } = options;

  useEffect(() => {
    if (status === "loading") return;

    // Se requer autenticação mas não está logado
    if (requireAuth && !session) {
      console.log("🔒 Não autenticado - Redirecionando para:", redirectTo);
      router.push(redirectTo);
      return;
    }

    // Se requer admin mas não é admin
    if (requireAdmin && session && !session.user?.isAdmin) {
      console.log("❌ Não é admin - Redirecionando para:", userRedirectTo);
      router.push(userRedirectTo);
      return;
    }

    // Se é admin mas está em área de usuário
    if (session?.user?.isAdmin && !requireAdmin && window.location.pathname.startsWith('/dashboard')) {
      console.log("🔄 Admin em área de usuário - Redirecionando para:", adminRedirectTo);
      router.push(adminRedirectTo);
      return;
    }

  }, [session, status, router, requireAuth, requireAdmin, redirectTo, adminRedirectTo, userRedirectTo]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    isAdmin: session?.user?.isAdmin || false,
    user: session?.user
  };
};

// Hook específico para verificar se é admin
export const useAdminAuth = () => {
  return useAuthRedirect({
    requireAuth: true,
    requireAdmin: true,
    adminRedirectTo: "/admin",
    userRedirectTo: "/dashboard"
  });
};

// Hook específico para usuários comuns
export const useUserAuth = () => {
  return useAuthRedirect({
    requireAuth: true,
    requireAdmin: false,
    adminRedirectTo: "/admin",
    userRedirectTo: "/dashboard"
  });
};

// Hook para redirecionamento inteligente após login
export const useSmartRedirect = () => {
  const { session, status } = useSession();
  const router = useRouter();

  const redirectBasedOnRole = () => {
    if (status === "loading") return;
    
    if (session?.user?.isAdmin) {
      console.log("🔄 Admin detectado - Redirecionando para /admin");
      router.push("/admin");
    } else if (session) {
      console.log("👤 Usuário comum - Redirecionando para /dashboard");
      router.push("/dashboard");
    }
  };

  return { redirectBasedOnRole };
}; 