import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import axios from 'axios';
import { DefaultSession } from "next-auth";

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
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';
        const loginUrl = `${backendUrl}/api/users/login`;
        
        console.log('=== DEBUG NEXTAUTH ===');
        console.log('Backend URL:', backendUrl);
        console.log('Login URL:', loginUrl);
        console.log('Credentials:', { email: credentials.email, password: '***' });

        try {
          console.log('Fazendo requisição para:', loginUrl);
          const response = await axios.post(loginUrl, {
            email: credentials.email,
            password: credentials.password,
          });
          
          console.log('Response status:', response.status);
          console.log('Response data:', response.data);
          console.log('📷 NextAuth - Image recebida:', response.data.image ? `Base64 com ${response.data.image.length} chars` : 'SEM IMAGEM');
          
          const user = response.data;
          if (user) {
            console.log('📤 NextAuth - User retornado:', {
              _id: user._id,
              name: user.name,
              email: user.email,
              hasImage: !!user.image,
              imageSize: user.image ? user.image.length : 0,
              isAdmin: user.isAdmin
            });
            return user;
          } else {
            return null;
          }
        } catch (error: any) {
          console.error('=== ERROR NEXTAUTH ===');
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          console.error('Error message:', error.message);
          console.error('Full error:', error);
          throw new Error(error.response?.data?.message || "Falha na autenticação");
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
          const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';
          const googleAuthUrl = `${backendUrl}/api/users/google-auth`;
          
          console.log('🔍 Google Auth - Criando/encontrando usuário:', user.email);
          
          const response = await axios.post(googleAuthUrl, {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: profile?.sub
          });
          
          console.log('✅ Google Auth - Usuário processado:', response.data);
          
          // Adicionar dados do backend ao user object
          user._id = response.data._id;
          user.isAdmin = response.data.isAdmin;
          user.token = response.data.token;
          
          return true;
        } catch (error: any) {
          console.error('❌ Erro no Google Auth:', error.response?.data || error.message);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log('🔑 JWT Callback - User recebido:', {
          _id: user._id,
          name: user.name,
          email: user.email,
          hasImage: !!user.image,
          imageSize: user.image ? user.image.length : 0,
          isAdmin: user.isAdmin
        });
        token.id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.isAdmin = user.isAdmin;
        token.accessToken = user.token;
        console.log('🔑 JWT Callback - Token criado:', { 
          hasImage: !!token.image, 
          isAdmin: token.isAdmin 
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('👤 Session Callback - Token recebido com image:', !!token.image);
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.accessToken = token.accessToken as string;
        console.log('👤 Session Callback - Session criada com image:', !!session.user.image);
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }