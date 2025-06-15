import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Middleware adicional pode ser adicionado aqui se necessário
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Especifica quais rotas devem ser protegidas
export const config = {
  matcher: ["/dashboard/:path*"]
}; 