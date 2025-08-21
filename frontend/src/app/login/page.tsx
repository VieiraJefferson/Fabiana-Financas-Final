"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FabiCharacter } from "@/components/fabi-character";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha incorretos");
        toast.error("Email ou senha incorretos");
      } else if (result?.ok) {
        // Obter a sessão para verificar o tipo de usuário
        const session = await getSession();
        
        if (session?.user) {
          const isAdmin = session.user.isAdmin || session.user.role === 'admin';
          
          toast.success("Login realizado com sucesso!");
          
          // Redirecionar baseado no tipo de usuário
          if (isAdmin) {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } else {
          toast.error("Erro ao obter dados do usuário");
        }
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo e Fabi */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              {/* Fabi Character */}
              <div className="flex-shrink-0">
                <FabiCharacter 
                  size="medium" 
                  animation="none"
                  showSpeechBubble={false}
                  disableAnimation={true}
                  imageSrc="/fabi-character.png"
                />
              </div>
              
              {/* App Name */}
              <div className="text-left">
                <img 
                  src="/logo3.png" 
                  alt="Fabi Finanças" 
                  className="h-32 w-auto"
                />
                <p className="text-muted-foreground text-sm">Sua mentora financeira</p>
              </div>
            </div>
            
            <p className="text-muted-foreground">Entre na sua conta</p>
          </div>

          {/* Social Login Button */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {/* Google Logo Colorido */}
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou com email e senha</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" className="text-white" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
            <div className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image Area */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/login-background.png"
            alt="Financial Success" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent"></div>
        </div>
        
        {/* Área para conteúdo sobreposto */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-bold text-foreground drop-shadow-lg">
              Transforme sua vida financeira
            </h2>
            <p className="text-lg text-muted-foreground drop-shadow-md">
              Com a Fabi, você aprende a gerenciar suas finanças de forma inteligente e alcança seus objetivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 