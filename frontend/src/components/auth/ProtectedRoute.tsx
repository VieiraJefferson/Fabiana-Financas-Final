import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRobust } from '@/hooks/useAuthRobust';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallback
}) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error } = useAuthRobust();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      console.log('🔐 Usuário não autenticado, redirecionando para login...');
      router.push('/login');
      return;
    }

    if (!isChecking && isAuthenticated && requireAdmin && user) {
      const isAdmin = user.role === 'admin' || user.role === 'super_admin' || user.isAdmin;
      if (!isAdmin) {
        console.log('🚫 Usuário não é admin, redirecionando...');
        router.push('/dashboard');
        return;
      }
    }
  }, [isChecking, isAuthenticated, requireAdmin, user, router]);

  // Loading inicial
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Erro de autenticação
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-500 text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Verificação de admin
  if (requireAdmin && user) {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin' || user.isAdmin;
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};

// Componente específico para rotas de admin
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
};

// Componente para rotas que precisam apenas de autenticação
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
