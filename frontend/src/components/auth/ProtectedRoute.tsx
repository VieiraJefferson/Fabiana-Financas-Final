import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
  fallback
}: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Se requer autenticação mas não está logado
    if (requireAuth && !session) {
      const redirect = redirectTo || "/login";
      console.log("🔒 Não autenticado - Redirecionando para:", redirect);
      router.push(redirect);
      return;
    }

    // Se requer admin mas não é admin
    if (requireAdmin && session && !session.user?.isAdmin) {
      const redirect = redirectTo || "/dashboard";
      console.log("❌ Não é admin - Redirecionando para:", redirect);
      router.push(redirect);
      return;
    }

    // Redirecionamento inteligente: se é admin mas está em área de usuário
    if (
      session?.user?.isAdmin && 
      !requireAdmin && 
      typeof window !== "undefined" && 
      window.location.pathname.startsWith('/dashboard')
    ) {
      console.log("🔄 Admin em área de usuário - Redirecionando para /admin");
      router.push("/admin");
      return;
    }

  }, [session, status, router, requireAuth, requireAdmin, redirectTo]);

  // Loading state
  if (status === "loading") {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Se não está autenticado e requer autenticação, não mostrar nada
  if (requireAuth && !session) {
    return null;
  }

  // Se não é admin e requer admin, não mostrar nada
  if (requireAdmin && session && !session.user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
};

// Componente específico para rotas admin
export const AdminRoute = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireAdmin={true}
      redirectTo="/dashboard"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

// Componente específico para rotas de usuário
export const UserRoute = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireAdmin={false}
      redirectTo="/login"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}; 