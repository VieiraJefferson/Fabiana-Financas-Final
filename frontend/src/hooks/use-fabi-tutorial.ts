"use client";

import { useState, useEffect } from "react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TUTORIAL_STORAGE_KEY = "fabi-tutorial-completed";

export function useFabiTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Tutorial steps for different pages
  const dashboardSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Bem-vindo ao Fabi Finanças! 🎉",
      description: "Olá! Eu sou a Fabi, sua mentora financeira pessoal. Vou te ajudar a navegar pela plataforma e alcançar seus objetivos financeiros!"
    },
    {
      id: "dashboard-overview",
      title: "Seu Dashboard Financeiro 📊",
      description: "Aqui você tem uma visão geral das suas finanças: saldo atual, gastos do mês e suas metas financeiras. É o seu centro de controle!"
    },
    {
      id: "transactions",
      title: "Gerencie suas Transações 💰",
      description: "Na seção 'Transações' você pode ver todo seu histórico financeiro. Clique em 'Nova Transação' para adicionar receitas ou despesas."
    },
    {
      id: "goals",
      title: "Defina suas Metas 🎯",
      description: "Em 'Metas' você pode criar objetivos financeiros como reserva de emergência, viagem dos sonhos ou aposentadoria. Eu te ajudo a alcançá-los!"
    },
    {
      id: "content",
      title: "Conteúdo Educativo 🎥",
      description: "Acesse vídeos exclusivos sobre educação financeira na seção 'Conteúdo'. Aprenda comigo sobre investimentos, orçamento e muito mais!"
    },
    {
      id: "mentorship",
      title: "Mentoria Personalizada 👩‍🏫",
      description: "Na área de 'Mentoria' você pode escolher seu plano e ter acesso a orientações personalizadas para sua situação financeira."
    },
    {
      id: "reports",
      title: "Relatórios Detalhados 📈",
      description: "Em 'Relatórios' você encontra análises detalhadas dos seus gastos, gráficos e insights para tomar melhores decisões financeiras."
    },
    {
      id: "complete",
      title: "Pronto para começar! ✨",
      description: "Agora você conhece todas as funcionalidades! Lembre-se: estou sempre aqui para te ajudar. Clique no meu ícone quando precisar de dicas!"
    }
  ];

  const contentSteps: TutorialStep[] = [
    {
      id: "content-welcome",
      title: "Biblioteca de Conteúdo 📚",
      description: "Aqui estão todos os vídeos educativos organizados por categoria e nível de dificuldade!"
    },
    {
      id: "content-filters",
      title: "Filtros Inteligentes 🔍",
      description: "Use os filtros para encontrar exatamente o que precisa: por categoria, nível do seu plano ou temas específicos."
    },
    {
      id: "content-progress",
      title: "Acompanhe seu Progresso 📊",
      description: "Vejo quais vídeos você já assistiu e recomendo o próximo conteúdo baseado no seu perfil e objetivos."
    }
  ];

  const goalsSteps: TutorialStep[] = [
    {
      id: "goals-welcome",
      title: "Suas Metas Financeiras 🎯",
      description: "Aqui você pode criar e acompanhar todas as suas metas financeiras. Vamos transformar sonhos em realidade!"
    },
    {
      id: "goals-types",
      title: "Tipos de Metas 📝",
      description: "Você pode criar metas de economia, investimento, quitação de dívidas, compras ou aposentadoria. Cada tipo tem estratégias específicas!"
    },
    {
      id: "goals-tracking",
      title: "Acompanhamento Visual 📈",
      description: "Veja o progresso das suas metas com barras visuais e receba dicas personalizadas para acelerar seus resultados!"
    }
  ];

  // Check if tutorial was completed
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    setIsCompleted(completed === "true");
  }, []);

  // Start tutorial for first-time users
  const startTutorial = (steps: TutorialStep[] = dashboardSteps, forceStart: boolean = false) => {
    if (!isCompleted || forceStart) {
      setCurrentStep(0);
      setIsVisible(true);
    }
  };

  // Force start tutorial (for manual restart)
  const restartTutorial = (steps: TutorialStep[] = dashboardSteps) => {
    console.log("🎓 Reiniciando tutorial...", { isCompleted, isVisible });
    setCurrentStep(0);
    setIsVisible(true);
  };

  // Navigation functions
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const skipTutorial = () => {
    setIsVisible(false);
    setIsCompleted(true);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  };

  const completeTutorial = () => {
    setIsVisible(false);
    setIsCompleted(true);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  };

  // Reset tutorial (for testing or user request)
  const resetTutorial = () => {
    setIsCompleted(false);
    setCurrentStep(0);
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  };

  // Show specific tutorial step
  const showStep = (stepIndex: number, steps: TutorialStep[] = dashboardSteps) => {
    setCurrentStep(stepIndex);
    setIsVisible(true);
  };

  // Get tutorial steps for different pages
  const getTutorialSteps = (page: "dashboard" | "content" | "goals" | "transactions" | "mentorship" | "reports") => {
    switch (page) {
      case "content":
        return contentSteps;
      case "goals":
        return goalsSteps;
      case "dashboard":
      default:
        return dashboardSteps;
    }
  };

  return {
    // State
    isVisible,
    currentStep,
    isCompleted,
    
    // Steps
    dashboardSteps,
    contentSteps,
    goalsSteps,
    getTutorialSteps,
    
    // Actions
    startTutorial,
    restartTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    showStep,
    
    // Setters
    setIsVisible,
    setCurrentStep
  };
}

// Hook for Fabi assistant (floating helper)
export function useFabiAssistant() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });

  // Contextual tips based on user actions
  const tips = {
    dashboard: [
      "💡 Dica: Mantenha suas transações sempre atualizadas para ter uma visão real das suas finanças!",
      "🎯 Que tal criar uma nova meta financeira? É o primeiro passo para realizar seus sonhos!",
      "📊 Seus gastos estão aumentando? Vamos analisar juntos na seção de relatórios!"
    ],
    transactions: [
      "💰 Lembre-se de categorizar suas transações para ter relatórios mais precisos!",
      "📝 Adicione descrições detalhadas para facilitar o controle futuro!",
      "🔄 Transações recorrentes? Configure-as para economizar tempo!"
    ],
    goals: [
      "🎯 Metas específicas e com prazo têm 90% mais chance de serem alcançadas!",
      "💪 Pequenos passos diários levam a grandes conquistas!",
      "📈 Acompanhe seu progresso regularmente para manter a motivação!"
    ],
    content: [
      "🎥 Assista aos vídeos na ordem recomendada para melhor aprendizado!",
      "📚 Faça anotações durante os vídeos para fixar melhor o conteúdo!",
      "🔄 Revise conteúdos anteriores sempre que tiver dúvidas!"
    ]
  };

  const showTip = (context: keyof typeof tips) => {
    const contextTips = tips[context];
    const randomTip = contextTips[Math.floor(Math.random() * contextTips.length)];
    setCurrentTip(randomTip);
    setIsVisible(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  const hideTip = () => {
    setIsVisible(false);
  };

  const updatePosition = (x: number, y: number) => {
    setPosition({ x, y });
  };

  return {
    isVisible,
    currentTip,
    position,
    showTip,
    hideTip,
    updatePosition,
    setIsVisible
  };
} 