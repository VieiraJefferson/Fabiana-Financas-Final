import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from 'axios';
import { DefaultSession } from "next-auth";

const handler = NextAuth({
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log('🔍 NextAuth authorize called');
        console.log('📧 Email:', credentials?.email);
        console.log('🌐 Backend URL:', process.env.NEXTAUTH_BACKEND_URL);
        
        if (!credentials) {
          console.log('❌ No credentials provided');
          return null;
        }

        const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';
        const loginUrl = `${backendUrl}/api/users/login`;
        
        console.log('🚀 Attempting login to:', loginUrl);

        try {
          const response = await axios.post(loginUrl, {
            email: credentials.email,
            password: credentials.password,
          }, {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
            }
          });

          console.log('✅ Backend response status:', response.status);
          const user = response.data;
          if (user) {
            console.log('✅ User authenticated successfully:', user.email);
            return user;
          } else {
            console.log('❌ No user data returned');
            return null;
          }
        } catch (error: any) {
          console.log('❌ Login error:', error.message);
          console.log('❌ Error response:', error.response?.data);
          console.log('❌ Error status:', error.response?.status);
          
          if (error.code === 'ECONNREFUSED') {
            throw new Error("Não foi possível conectar com o servidor.");
          }
          
          if (error.response?.status === 401) {
            throw new Error("Email ou senha incorretos");
          }
          
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