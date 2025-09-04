import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const backendBase = process.env.NEXT_PUBLIC_API_URL!; // ex.: https://seu-backend.onrender.com

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
        role: { label: "Role", type: "text" }, // "admin" | "user"
      },
      async authorize(credentials) {
        const role = credentials?.role === "admin" ? "admin" : "user";
        
        // Corrigir a URL para evitar barras duplas
        const baseUrl = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
        const url =
          role === "admin"
            ? `${baseUrl}/api/admin/login`
            : `${baseUrl}/api/users/login`;

        console.log('🔗 URL do backend:', url);

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // se seu backend também usa cookie httpOnly, não faz mal incluir:
          credentials: "include",
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const data = await resp.json().catch(() => ({} as any));
        if (!resp.ok) {
          console.error('❌ Erro do backend:', data);
          return null;
        }

        const u = (data.user || data.admin || data) as any;
        return {
          id: u.id || u._id,
          _id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role || (u.isAdmin ? "admin" : "user"),
          isAdmin: u.isAdmin || u.role === "admin",
          accessToken: data.token, // opcional
          token: data.token || 'dummy-token'
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as any;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) session.user = token.user as any;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: "/login" },
  debug: true,
});

export { handler as GET, handler as POST };