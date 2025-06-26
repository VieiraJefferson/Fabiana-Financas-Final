'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStatusProps {
  onClose?: () => void;
}

export default function PaymentStatus({ onClose }: PaymentStatusProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      setStatus('success');
      setMessage('Pagamento realizado com sucesso! Seu plano foi ativado.');
      toast.success('Pagamento aprovado!');
    } else if (paymentStatus === 'cancelled') {
      setStatus('cancelled');
      setMessage('Pagamento cancelado. Você pode tentar novamente quando quiser.');
      toast.error('Pagamento cancelado');
    } else if (paymentStatus === 'error') {
      setStatus('error');
      setMessage('Ocorreu um erro no processamento do pagamento. Tente novamente.');
      toast.error('Erro no pagamento');
    } else {
      // Se não há parâmetros de pagamento, não mostrar nada
      return;
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando status do pagamento...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="max-w-md mx-auto border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-green-700">Pagamento Aprovado!</CardTitle>
          <CardDescription className="text-green-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onClose} className="w-full">
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'cancelled') {
    return (
      <Card className="max-w-md mx-auto border-yellow-200 bg-yellow-50">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
          <CardTitle className="text-yellow-700">Pagamento Cancelado</CardTitle>
          <CardDescription className="text-yellow-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onClose} variant="outline" className="w-full">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="max-w-md mx-auto border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-red-700">Erro no Pagamento</CardTitle>
          <CardDescription className="text-red-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onClose} variant="outline" className="w-full">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
} 