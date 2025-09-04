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
        const url =
          role === "admin"
            ? `${backendBase}/api/admin/login`
            : `${backendBase}/api/users/login`;

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
        if (!resp.ok) return null;

        const u = (data.user || data.admin || data) as any;
        return {
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: u.role || (u.isAdmin ? "admin" : "user"),
          accessToken: data.token, // opcional
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