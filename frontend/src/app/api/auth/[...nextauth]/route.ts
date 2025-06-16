import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from 'axios';
import { DefaultSession } from "next-auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';
        const loginUrl = `${backendUrl}/api/users/login`;

        try {
          const { data: user } = await axios.post(loginUrl, {
            email: credentials.email,
            password: credentials.password,
          });

          if (user) {
            return user;
          } else {
            return null;
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || "Falha na autenticação");
        }
      },
    })
  ],
  pages: {
    signIn: '/login',
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }