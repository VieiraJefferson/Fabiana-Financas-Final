"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface FabiCharacterProps {
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
  imageSrc?: string;
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

export function FabiCharacter({ size = "medium", className, onClick, imageSrc = "/fabi-character.png" }: FabiCharacterProps) {
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
          <FabiCharacter size="large" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">
            Atenção! ⚠️
          </h2>
          <p className="text-muted-foreground mb-4">
            Você está próximo do limite do seu orçamento.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            Entendi
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
          <FabiCharacter size="large" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Orçamento Estourado! 🚨
          </h2>
          <p className="text-muted-foreground mb-4">
            Você ultrapassou seu limite de gastos.
          </p>
          <Button onClick={onClose} variant="destructive" className="w-full">
            Revisar Gastos
          </Button>
        </CardContent>
      </Card>
    </div>
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