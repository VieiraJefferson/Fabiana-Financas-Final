"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FabiCharacter } from "@/components/fabi-character";
import { useFabiTutorial } from "@/hooks/use-fabi-tutorial";

export default function AjudaPage() {
  const { restartTutorial } = useFabiTutorial();

  const faqs = [
    {
      question: "Como adicionar uma nova transação?",
      answer: "Clique em 'Nova Transação' no menu lateral, preencha os dados e salve. Você pode categorizar como receita ou despesa."
    },
    {
      question: "Como criar uma meta financeira?",
      answer: "Vá em 'Metas' no menu, clique em 'Nova Meta', defina o valor, prazo e categoria. A Fabi te ajudará a acompanhar o progresso!"
    },
    {
      question: "Como acessar os vídeos educativos?",
      answer: "Na seção 'Conteúdo' você encontra todos os vídeos organizados por categoria e nível do seu plano."
    },
    {
      question: "Como funciona a mentoria?",
      answer: "Em 'Mentoria' você pode escolher seu plano e ter acesso a orientações personalizadas da Fabi para sua situação financeira."
    },
    {
      question: "Como ver meus relatórios?",
      answer: "Em 'Relatórios' você encontra análises detalhadas dos seus gastos, gráficos e insights para tomar melhores decisões."
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <FabiCharacter 
            size="large" 
            animation="wave"
            showSpeechBubble={true}
            speechText="Estou aqui para te ajudar! 💙"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Ajuda</h1>
          <p className="text-muted-foreground">
            Encontre respostas para suas dúvidas sobre o Fabi Finanças
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-lg">🎓 Tutorial Completo</CardTitle>
            <CardDescription>
              Aprenda a usar todas as funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => restartTutorial()}
              className="w-full"
            >
              Iniciar Tutorial
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-lg">💬 Suporte</CardTitle>
            <CardDescription>
              Fale conosco diretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-lg">📚 Documentação</CardTitle>
            <CardDescription>
              Guias detalhados e dicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Documentação
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Perguntas Frequentes</h2>
        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Ainda precisa de ajuda?</CardTitle>
          <CardDescription>
            Nossa equipe está sempre pronta para te ajudar!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">📧 Email</h4>
              <p className="text-muted-foreground">suporte@fabifinancas.com</p>
            </div>
            <div>
              <h4 className="font-medium">⏰ Horário de Atendimento</h4>
              <p className="text-muted-foreground">Segunda a Sexta, 9h às 18h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 