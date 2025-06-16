import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Estendendo a interface da Sessão
  interface Session {
    user: {
      id: string;
      role: string;
      isAdmin: boolean;
    } & DefaultSession["user"]; // Mantém os campos padrão (name, email, image)
    accessToken?: string;
  }

  // Estendendo a interface do Usuário
  interface User extends DefaultUser {
    _id: string;
    role: string;
    isAdmin: boolean;
    token: string;
  }
}

declare module "next-auth/jwt" {
  // Estendendo a interface do Token JWT
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    isAdmin: boolean;
    accessToken: string;
  }
} 