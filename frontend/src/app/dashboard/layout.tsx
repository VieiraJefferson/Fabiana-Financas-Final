"use client";

import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNavbar } from '@/components/layout/BottomNavbar';
import { ToastProvider } from '@/components/ui/toast-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AuthRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar para desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar />
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header pode ser adicionado aqui se necessário */}
          
          {/* Conteúdo da página */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </div>

        {/* Navegação inferior para mobile */}
        <div className="md:hidden">
          <BottomNavbar />
        </div>
      </div>

      {/* Provider de toasts */}
      <ToastProvider />
    </AuthRoute>
  );
} 