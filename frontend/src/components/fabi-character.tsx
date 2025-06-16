"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart3, PieChart } from "lucide-react";

interface FabiCharacterProps {
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
  imageSrc?: string;
  animation?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
  disableAnimation?: boolean;
}

interface TutorialStep {
  title: string;
  description: string;
}

interface FabiTutorialProps {
  steps: TutorialStep[];
  isVisible: boolean;
  currentStep: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
}

interface FabiModalProps {
  onClose: () => void;
}

export function FabiCharacter({ 
  size = "medium", 
  className, 
  onClick, 
  imageSrc = "/fabi-character.png",
  animation,
  showSpeechBubble,
  speechText,
  disableAnimation
}: FabiCharacterProps) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24", 
    large: "w-32 h-32"
  };

  return (
    <div className={cn("fabi-character-container", className)}>
      <div className="relative cursor-pointer" onClick={onClick}>
        <div className={cn("relative", sizeClasses[size])}>
          <img 
            src={imageSrc} 
            alt="Fabi - Mentora Financeira" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export function FabiTutorial({ steps, isVisible, currentStep, onNext, onPrevious, onSkip, onComplete }: FabiTutorialProps) {
  if (!isVisible || !steps || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      onNext?.();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onPrevious?.();
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-2 border-primary/20">
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FabiCharacter size="small" />
              <div>
                <CardTitle className="text-xl text-primary">Tutorial da Fabi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Passo {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {currentStepData?.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentStepData?.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2 flex-1">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 sm:flex-none"
              >
                Pular Tutorial
              </Button>

              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isLastStep ? (
                  <>
                    Finalizar
                    <span className="ml-2">🎉</span>
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FabiGoalAchieved({ onClose }: FabiModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardContent className="text-center p-6">
          <FabiCharacter size="large" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Parabéns! 🎉
          </h2>
          <p className="text-muted-foreground mb-4">
            Você alcançou sua meta financeira!
          </p>
          <Button onClick={onClose} className="w-full">
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function FabiBudgetWarning({ onClose }: FabiModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-yellow-200">
        <CardContent className="text-center p-6">
          <FabiCharacter size="large" className="mx-auto mb-4" imageSrc="/fabi-sad.png" />
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">
            Atenção! ⚠️
          </h2>
          <p className="text-muted-foreground mb-4">
            Oi! Notei que você já gastou bastante este mês. Que tal darmos uma olhada nos seus gastos juntos?
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            Vamos revisar!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function FabiBudgetDanger({ onClose }: FabiModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-red-200">
        <CardContent className="text-center p-6">
          <FabiCharacter size="large" className="mx-auto mb-4" imageSrc="/fabi-very-sad.png" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Ops! Orçamento Estourado! 🚨
          </h2>
          <p className="text-muted-foreground mb-4">
            Ei, parece que ultrapassamos o limite do orçamento este mês. Não se preocupe, vamos ajustar isso juntos!
          </p>
          <Button onClick={onClose} variant="destructive" className="w-full">
            Vamos corrigir isso!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Novo componente para alertas de orçamento integrados
interface FabiBudgetAlertProps {
  budgetStatus: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
  };
  onViewExpenses: () => void;
  onViewReports: () => void;
}

export function FabiBudgetAlert({ budgetStatus, onViewExpenses, onViewReports }: FabiBudgetAlertProps) {
  const getFabiImage = () => {
    switch (budgetStatus.status) {
      case 'safe':
        return '/fabi-happy.png';
      case 'warning':
        return '/fabi-sad.png';
      case 'danger':
        return '/fabi-very-sad.png';
      default:
        return '/fabi-neutral.png';
    }
  };

  const getFabiMessage = () => {
    switch (budgetStatus.status) {
      case 'safe':
        return 'Parabéns! Você está controlando muito bem seus gastos este mês! Continue assim! 😊';
      case 'warning':
        return 'Oi! Notei que você já gastou bastante este mês. Que tal darmos uma olhada nos seus gastos juntos? 🤔';
      case 'danger':
        return 'Ei, parece que ultrapassamos o limite do orçamento este mês. Não se preocupe, vamos ajustar isso juntos! 😟';
      default:
        return 'Como estão suas finanças hoje?';
    }
  };

  const getTitle = () => {
    switch (budgetStatus.status) {
      case 'safe':
        return 'Muito bem! 🎉';
      case 'warning':
        return 'Atenção! ⚠️';
      case 'danger':
        return 'Ops! Orçamento Estourado! 🚨';
      default:
        return 'Olá!';
    }
  };

  const getButtonText = () => {
    switch (budgetStatus.status) {
      case 'safe':
        return 'Continue assim!';
      case 'warning':
        return 'Vamos revisar!';
      case 'danger':
        return 'Vamos corrigir isso!';
      default:
        return 'Entendi';
    }
  };

  if (budgetStatus.status === 'safe') {
    return null; // Não mostra alerta quando está tudo bem
  }

  return (
    <Card className={cn(
      "border-2",
      budgetStatus.status === 'danger' 
        ? "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-500/20 md:bg-red-50 md:dark:bg-red-900/10" 
        : "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-500/20 md:bg-yellow-50 md:dark:bg-yellow-900/10",
      // Remove background and border on mobile, add centering
      "max-md:bg-transparent max-md:dark:bg-transparent max-md:border-0 max-md:shadow-none"
    )}>
      <CardContent className="p-3 md:p-6">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          {/* Fabi Character - Centralizado no mobile, lado esquerdo no desktop */}
          <div className="flex flex-shrink-0 justify-center md:justify-start">
            <FabiCharacter 
              size="large" 
              imageSrc={getFabiImage()}
              className="w-16 h-16 md:w-20 md:h-20"
            />
          </div>
          
          {/* Message Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className={cn(
              "text-lg md:text-xl font-bold mb-2",
              budgetStatus.status === 'danger' 
                ? "text-red-700 dark:text-red-300" 
                : "text-yellow-700 dark:text-yellow-300"
            )}>
              {getTitle()}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 leading-relaxed">
              {getFabiMessage()}
            </p>
            
            {/* Budget Progress */}
            <div className="space-y-2 mb-3 md:mb-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Gasto do mês</span>
                <span className="font-medium text-xs md:text-sm">
                  R$ {budgetStatus.spent.toFixed(2).replace('.', ',')} / R$ {budgetStatus.budget.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 dark:bg-gray-700">
                <div 
                  className={cn(
                    "h-2 md:h-3 rounded-full transition-all duration-300",
                    budgetStatus.status === 'danger' 
                      ? "bg-red-500" 
                      : "bg-yellow-500"
                  )}
                  style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetStatus.percentage.toFixed(1)}% usado</span>
                <span className="text-right">
                  {budgetStatus.remaining >= 0 
                    ? `R$ ${budgetStatus.remaining.toFixed(2).replace('.', ',')} restante`
                    : `R$ ${Math.abs(budgetStatus.remaining).toFixed(2).replace('.', ',')} acima`
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                onClick={onViewExpenses}
              >
                <BarChart3 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Ver Gastos
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                onClick={onViewReports}
              >
                <PieChart className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Relatórios
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function useFabiFinancialFeedback() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  const analyzeBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 100) {
      setActiveModal('danger');
    } else if (percentage >= 80) {
      setActiveModal('warning');
    }
  };

  return {
    activeModal,
    closeModal,
    analyzeBudgetStatus
  };
} 