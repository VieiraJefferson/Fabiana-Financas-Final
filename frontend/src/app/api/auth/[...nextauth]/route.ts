import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://fabiana-financas-backend.onrender.com";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log('🔐 Tentando login com credenciais...');
          
          const response = await axios.post(`${backendUrl}/api/users/login`, {
            email: credentials.email,
            password: credentials.password,
          }, {
            withCredentials: true, // CRÍTICO: enviar cookies
            headers: {
              'Content-Type': 'application/json',
            }
          });

          console.log('✅ Login bem-sucedido no backend');
          
          if (response.data && response.data.user) {
            const user = response.data.user;
            
            // Retornar dados do usuário com as propriedades corretas
            return {
              id: user._id || user.id,
              _id: user._id || user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              isAdmin: user.isAdmin,
              role: user.role,
              token: user.token || 'dummy-token' // Adicionar token para satisfazer o tipo
            };
          }

          return null;
        } catch (error: any) {
          console.error('❌ Erro no login:', error.response?.data || error.message);
          
          if (error.response?.status === 401) {
            throw new Error('Email ou senha inválidos');
          }
          
          throw new Error('Erro interno do servidor');
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Se for o primeiro login, incluir dados do usuário
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.role = user.role;
        token.image = user.image;
        token.accessToken = user.token; // Adicionar o token de acesso
      }

      return token;
    },
    async session({ session, token }) {
      // Incluir dados do usuário na sessão
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.role = token.role as string;
        session.user.image = token.image as string;
        session.accessToken = token.accessToken as string; // Adicionar o token de acesso à sessão
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Para login com Google, verificar se o usuário existe no backend
      if (account?.provider === 'google') {
        try {
          const response = await axios.post(`${backendUrl}/api/users/google-auth`, {
            email: user.email,
            name: user.name,
            image: user.image,
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.data && response.data.user) {
            // Atualizar dados do usuário com informações do backend
            user.id = response.data.user._id || response.data.user.id;
            user._id = response.data.user._id || response.data.user.id;
            user.isAdmin = response.data.user.isAdmin;
            user.role = response.data.user.role;
            user.token = response.data.user.token || 'dummy-token';
            return true;
          }
        } catch (error) {
          console.error('Erro na autenticação Google:', error);
          return false;
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirecionar para dashboard após login
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };