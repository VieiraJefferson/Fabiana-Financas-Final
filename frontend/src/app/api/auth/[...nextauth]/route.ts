import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "@/backend/config/db"; // Usando o novo alias
import User from "@/backend/models/userModel"; // Usando o novo alias
import axios from 'axios';
import { DefaultSession } from "next-auth";

// Conecta ao banco de dados assim que a API é inicializada
connectDB();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // O nome que será exibido no formulário de login (por exemplo, "Entrar com Email")
      name: "Credentials",
      // `credentials` é usado para gerar um formulário na página de login padrão.
      // Você pode especificar os campos que espera no seu próprio formulário de login.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        console.log('=== DEBUG NEXTAUTH ===');
        console.log('NEXTAUTH_BACKEND_URL:', process.env.NEXTAUTH_BACKEND_URL);
        
        const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';
        const loginUrl = `${backendUrl}/api/users/login`;
        console.log('URL de login:', loginUrl);

        try {
          // A URL completa é necessária aqui porque esta parte do código roda no lado do servidor do Next.js,
          // que não usa os rewrites do next.config.js.
          console.log('Fazendo requisição para:', loginUrl);
          console.log('Dados enviados:', { email: credentials.email, password: '[HIDDEN]' });
          
          const { data: user } = await axios.post(loginUrl, {
            email: credentials.email,
            password: credentials.password,
          });

          console.log('Resposta do backend:', user ? 'Usuário recebido' : 'Nenhum usuário');
          
          if (user) {
            // Retorna o objeto do usuário, que será codificado no JWT
            return user;
          } else {
            // Se o login falhar (usuário não encontrado ou senha errada), a API do backend retorna um erro,
            // que será capturado pelo bloco catch. Retornar null aqui é uma segurança extra.
            return null;
          }
        } catch (error: any) {
          console.log('Erro na requisição:', error.message);
          console.log('Status do erro:', error.response?.status);
          console.log('Dados do erro:', error.response?.data);
          
          // Lança um erro que o NextAuth irá capturar e mostrar ao usuário.
          // A mensagem de erro vem da nossa API de backend.
          throw new Error(error.response?.data?.message || "Falha na autenticação");
        }
      },
    })
  ],
  pages: {
    signIn: '/login', // A página de login agora é /login
    error: "/login", // Redireciona para /login em caso de erro, com uma mensagem
  },
  callbacks: {
    async jwt({ token, user }) {
      // O 'user' só está presente no primeiro login.
      // Nós o usamos para passar os dados do usuário para o token.
      if (user) {
        token.id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.accessToken = user.token; // Armazenar o JWT token do backend
      }
      return token;
    },
    async session({ session, token }) {
      // Nós pegamos os dados do token e os passamos para o objeto da sessão,
      // tornando-os disponíveis no lado do cliente.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.accessToken = token.accessToken as string; // Disponibilizar o JWT token
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

// Adicionar a tipagem customizada para a sessão
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    accessToken: string;
  }
} 