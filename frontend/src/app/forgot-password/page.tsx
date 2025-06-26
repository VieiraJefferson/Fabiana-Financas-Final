'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    setLoading(true);
    
    try {
      // Simular envio de email (você pode implementar isso no backend futuramente)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSent(true);
      toast.success('Se o email existir em nossa base de dados, você receberá instruções para redefinir sua senha.');
    } catch (error) {
      toast.error('Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Email Enviado!</CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada e spam
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Se o email <strong>{email}</strong> estiver cadastrado em nossa plataforma, 
              você receberá instruções para redefinir sua senha.
            </p>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Login
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {setSent(false); setEmail('');}}
                className="w-full"
              >
                Tentar outro email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Esqueci a Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber instruções de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Instruções
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link 
              href="/login" 
              className="inline-flex items-center font-medium text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 