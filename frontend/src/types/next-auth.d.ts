import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Estendendo a interface da Sessão
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]; // Mantém os campos padrão (name, email, image)
  }

  // Estendendo a interface do Usuário
  interface User extends DefaultUser {
    role: string;
  }
}

declare module "next-auth/jwt" {
  // Estendendo a interface do Token JWT
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
} 