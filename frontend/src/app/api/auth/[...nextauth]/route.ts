import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,         // defina isso no Vercel
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
        role:     { label: "Role",  type: "text" }, // "admin" | "user"
      },
      async authorize(credentials) {
        try {
          const role = credentials?.role === "admin" ? "admin" : "user";
          const base = process.env.NEXT_PUBLIC_API_URL; // ex: https://seu-backend.onrender.com
          const url  = role === "admin" ? `${base}/api/admin/login` : `${base}/api/users/login`;

          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // importante p/ cookies httpOnly do backend (se configurados)
            credentials: "include",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await resp.json().catch(() => ({}));

          if (!resp.ok) {
            // Se o backend devolver { error: "..." }, repassa a mensagem
            console.error("authorize backend error:", data?.error || resp.statusText);
            return null; // faz NextAuth retornar 401 CredentialsSignin
          }

          // Backend pode devolver { user: {...} } ou { admin: {...} } ou direto o objeto
          const u = data.user || data.admin || data || {};
          return {
            id:   u.id || u._id,
            name: u.name,
            email: u.email,
            role:  u.role || (u.isAdmin ? "admin" : "user"),
            accessToken: data.token, // opcional: se você ainda usa bearer no FE
          };
        } catch (e: any) {
          console.error("authorize exception:", e?.message || e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = { id: user.id, name: user.name, email: user.email, role: user.role };
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
  debug: true, // habilita logs úteis no server
});

export { default as GET, default as POST };