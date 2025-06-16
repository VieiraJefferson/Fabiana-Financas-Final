"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Componente para a tela de Login
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard", // Redirecionar para um dashboard após login
    });
  };

  return (
    <section className="max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Acesse sua Conta</CardTitle>
            <CardDescription>
              Entre para continuar sua jornada ou cadastre-se para começar agora.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">Entrar</Button>
            <Button variant="outline" className="w-full" type="button">
              Criar uma conta
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}

// Componente para a tela de boas-vindas (usuário logado)
function WelcomeScreen({ session }: { session: any }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">Bem-vindo(a) de volta, {session.user.name}!</h2>
      <p className="text-md text-gray-600 mt-2">Sua role é: <span className="font-semibold">{session.user.role}</span></p>
      <div className="mt-6 flex gap-4 justify-center">
        <Button onClick={() => { /* Navegar para o dashboard */ }}>Acessar Dashboard</Button>
        <Button variant="destructive" onClick={() => signOut()}>
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="container mx-auto px-6 py-10 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900">
          Bem-vindo ao Fabi Finanças
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Sua jornada para a liberdade financeira começa aqui. Controle, planeje e alcance seus objetivos.
        </p>
      </header>

      <main className="container mx-auto px-6 flex-grow">
        {/* Seção de Funcionalidades */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span role="img" aria-label="money bag">💰</span> Controle Total
              </CardTitle>
              <CardDescription>
                Visualize suas finanças de forma clara com dashboards intuitivos e relatórios completos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Monitore despesas, receitas e orçamentos em tempo real.</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span role="img" aria-label="target">🎯</span> Mentorias
              </CardTitle>
              <CardDescription>
                Agende sessões com especialistas e receba orientação personalizada para o seu sucesso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Acelere seu crescimento com o apoio de quem entende do assunto.</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span role="img" aria-label="books">📚</span> Educação
              </CardTitle>
              <CardDescription>
                Acesse uma biblioteca de conteúdos exclusivos, com vídeos, aulas e materiais práticos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Aprenda a investir, economizar e fazer seu dinheiro render mais.</p>
            </CardContent>
          </Card>
        </section>

        <div className="text-center">
            <a href="/login">
                <Button size="lg">Acessar minha conta</Button>
            </a>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} VieiraDev. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
