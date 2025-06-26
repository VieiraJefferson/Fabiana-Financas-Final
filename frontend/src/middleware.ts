import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Log para debugging (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Middleware - Path:', pathname);
      console.log('🔒 Middleware - User:', token?.email);
      console.log('🔒 Middleware - isAdmin:', token?.isAdmin);
    }

    // Verificar se usuário não-admin está tentando acessar área de admin
    if (pathname.startsWith('/admin')) {
      const isAdmin = token?.isAdmin || token?.role === 'admin' || token?.role === 'super_admin';
      
      if (!isAdmin) {
        console.log('❌ Acesso negado ao admin - Redirecionando para dashboard');
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Sempre permitir páginas públicas
        if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/') {
          return true;
        }

        // Verificar se tem token para páginas protegidas
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

// Especifica quais rotas devem ser protegidas
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*"
  ]
}; 