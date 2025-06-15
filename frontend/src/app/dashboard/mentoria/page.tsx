"use client";

import { useState } from "react";
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

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
}

export default function MentoriaPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingPeriod === 'monthly' ? 29.99 : 299.99,
      period: billingPeriod === 'monthly' ? '/mês' : '/ano',
      description: 'Ideal para quem está começando a organizar as finanças',
      features: [
        'Controle básico de transações',
        'Relatórios mensais simples',
        'Suporte por email',
        'Acesso a conteúdo básico',
        'Até 100 transações/mês',
        'Dashboard personalizado'
      ],
      buttonText: 'Começar Grátis',
      buttonVariant: 'outline'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: billingPeriod === 'monthly' ? 59.99 : 599.99,
      period: billingPeriod === 'monthly' ? '/mês' : '/ano',
      popular: true,
      description: 'Para quem quer acelerar o crescimento financeiro',
      features: [
        'Tudo do plano Basic',
        'Relatórios avançados com gráficos',
        'Metas e planejamento financeiro',
        'Sessões de mentoria mensais',
        'Acesso a cursos exclusivos',
        'Análise de investimentos',
        'Transações ilimitadas',
        'Suporte prioritário'
      ],
      buttonText: 'Assinar Agora',
      buttonVariant: 'default'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingPeriod === 'monthly' ? 99.99 : 999.99,
      period: billingPeriod === 'monthly' ? '/mês' : '/ano',
      description: 'Solução completa para independência financeira',
      features: [
        'Tudo do plano Advanced',
        'Mentoria individual semanal',
        'Consultoria personalizada',
        'Acesso a todos os cursos',
        'Comunidade VIP exclusiva',
        'Análise de portfólio',
        'Planejamento de aposentadoria',
        'Suporte 24/7',
        'Relatórios personalizados'
      ],
      buttonText: 'Falar com Consultor',
      buttonVariant: 'outline'
    }
  ];

  const handlePlanSelection = (planId: string) => {
    // TODO: Implementar lógica de seleção de plano
    console.log('Plano selecionado:', planId);
    
    if (planId === 'basic') {
      alert('Plano Basic ativado! Você já tem acesso às funcionalidades básicas.');
    } else if (planId === 'premium') {
      alert('Redirecionando para consultor especializado...');
    } else {
      alert('Redirecionando para pagamento do plano Advanced...');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular 
                ? 'border-primary shadow-lg scale-105' 
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-muted-foreground">
                    Economize {formatPrice(plan.price * 0.17)} por ano
                  </p>
                )}
              </div>
              <CardDescription className="text-center">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Button 
                className="w-full" 
                variant={plan.buttonVariant}
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.buttonText}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Benefícios */}
      <div className="bg-muted/50 rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Por que escolher a Fabi Finanças?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold">Metodologia Comprovada</h3>
            <p className="text-sm text-muted-foreground">
              Sistema testado e aprovado por mais de 10.000 pessoas que alcançaram a independência financeira
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">👩‍🏫</span>
            </div>
            <h3 className="font-semibold">Mentoria Especializada</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhamento direto com especialistas certificados em planejamento financeiro
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="font-semibold">Resultados Garantidos</h3>
            <p className="text-sm text-muted-foreground">
              Garantia de 30 dias ou seu dinheiro de volta. Estamos confiantes no nosso método
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Rápido */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Dúvidas Frequentes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como funciona a mentoria?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sessões individuais por videochamada com mentores especializados, focadas nos seus objetivos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Há garantia de resultados?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Oferecemos garantia de 30 dias. Se não ficar satisfeito, devolvemos 100% do valor.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posso mudar de plano depois?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Final */}
      <div className="text-center space-y-4 bg-primary/5 rounded-lg p-8">
        <h2 className="text-2xl font-bold">
          Pronto para transformar sua vida financeira?
        </h2>
        <p className="text-muted-foreground">
          Junte-se a milhares de pessoas que já alcançaram a independência financeira
        </p>
        <Button size="lg" onClick={() => handlePlanSelection('advanced')}>
          Começar Agora - Plano Advanced
        </Button>
      </div>
    </div>
  );
} 