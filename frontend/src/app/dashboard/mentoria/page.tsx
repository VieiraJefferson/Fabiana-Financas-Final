"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Loader2 } from "lucide-react";
import { usePayments, Plan, SubscriptionInfo } from "@/hooks/usePayments";
import { toast } from "sonner";

export default function MentoriaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { loading, error, createCheckoutSession, getAvailablePlans, getSubscriptionInfo } = usePayments();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Carregar planos e informações de assinatura
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingPlans(true);
        const [plansData, subscriptionData] = await Promise.all([
          getAvailablePlans(),
          getSubscriptionInfo()
        ]);
        
        setPlans(plansData);
        setSubscriptionInfo(subscriptionData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar informações dos planos');
      } finally {
        setLoadingPlans(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session]);

  // Se for admin, mostrar acesso total
  if (session?.user?.isAdmin) {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Painel Administrativo - Mentoria
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Como administrador, você tem acesso completo a todas as funcionalidades de mentoria
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Acesso Administrativo Total</CardTitle>
            <CardDescription>
              Você tem privilégios de administrador e acesso irrestrito a todos os recursos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Recursos Disponíveis:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Controle total de transações</li>
                  <li>✅ Relatórios avançados ilimitados</li>
                  <li>✅ Gerenciamento de usuários</li>
                  <li>✅ Análise de dados completa</li>
                  <li>✅ Configurações do sistema</li>
                  <li>✅ Suporte prioritário</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Ferramentas Admin:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Painel de cursos</li>
                  <li>✅ Upload de vídeos</li>
                  <li>✅ Gestão de conteúdo</li>
                  <li>✅ Métricas avançadas</li>
                  <li>✅ Backup de dados</li>
                  <li>✅ Logs do sistema</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/admin')} className="w-40">
                Painel Admin
              </Button>
              <Button onClick={() => router.push('/admin/cursos')} variant="outline" className="w-40">
                Gerenciar Cursos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePlanSelection = async (plan: Plan) => {
    if (loading) return;

    try {
      // Verificar se é plano gratuito
      if (plan.name === 'free') {
        toast.success('Você já tem acesso ao plano gratuito!');
        return;
      }

      // Verificar se já tem este plano
      if (subscriptionInfo?.currentPlan === plan.name) {
        toast.info('Você já possui este plano');
        return;
      }

      // Redirecionar para checkout do Stripe
      await createCheckoutSession(plan._id, billingPeriod);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar pagamento');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanPrice = (plan: Plan) => {
    return billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly;
  };

  const getPlanPeriod = () => {
    return billingPeriod === 'yearly' ? '/ano' : '/mês';
  };

  if (loadingPlans) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Escolha Seu Plano de Mentoria
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Acelere sua jornada rumo à independência financeira com nossos planos de mentoria especializada
        </p>
      </div>

      {/* Plano Atual */}
      {subscriptionInfo && (
        <Card className="max-w-md mx-auto border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Seu Plano Atual</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="text-sm">
                {subscriptionInfo.planDetails?.displayName || subscriptionInfo.currentPlan}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {subscriptionInfo.planExpiry && (
              <p className="text-sm text-muted-foreground">
                Expira em: {new Date(subscriptionInfo.planExpiry).toLocaleDateString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toggle de Período */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <span className="ml-2 px-2 py-1 bg-success/10 text-success text-xs rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Cards de Planos */}
      <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan._id} className={`relative ${plan.isPopular ? 'ring-2 ring-primary' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
              <div className="text-4xl font-bold text-primary">
                {formatPrice(getPlanPrice(plan))}
                <span className="text-lg text-muted-foreground font-normal">
                  {getPlanPeriod()}
                </span>
              </div>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.highlights.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handlePlanSelection(plan)}
                disabled={loading || subscriptionInfo?.currentPlan === plan.name}
                className="w-full"
                variant={plan.isPopular ? "default" : "outline"}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {subscriptionInfo?.currentPlan === plan.name 
                  ? 'Plano Atual' 
                  : plan.name === 'free' 
                    ? 'Gratuito' 
                    : 'Assinar Agora'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recursos Adicionais */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Por que escolher nossa mentoria?
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Mentoria Personalizada</h3>
            <p className="text-sm text-muted-foreground">
              Sessões individuais com especialistas em finanças pessoais
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Resultados Rápidos</h3>
            <p className="text-sm text-muted-foreground">
              Metodologia comprovada para organizar suas finanças em 30 dias
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Suporte Contínuo</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhamento constante para garantir seu sucesso financeiro
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
} 