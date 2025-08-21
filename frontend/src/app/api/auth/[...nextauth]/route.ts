import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import axios from 'axios';

const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Requisição direta para o backend
          const response = await axios.post(`${backendUrl}/api/users/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const user = response.data;
          
          if (user && user._id) {
            return {
              id: user._id,
              _id: user._id,
              name: user.name,
              email: user.email,
              image: user.image,
              isAdmin: user.isAdmin,
              role: user.role || (user.isAdmin ? 'admin' : 'user'),
              token: user.token
            };
          }
          
          return null;
        } catch (error) {
          console.error('Erro na autenticação:', error.response?.data || error.message);
          return null;
        }
      },
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Para login com Google, criar/encontrar usuário no backend
      if (account?.provider === "google") {
        try {
          const response = await axios.post(`${backendUrl}/api/users/google-auth`, {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: profile?.sub
          });
          
          // Adicionar dados do backend ao user object
          user.id = response.data._id;
          user._id = response.data._id;
          user.isAdmin = response.data.isAdmin;
          user.role = response.data.role || (response.data.isAdmin ? 'admin' : 'user');
          user.token = response.data.token;
          
        } catch (error) {
          console.error('Erro no Google Auth:', error.response?.data || error.message);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }