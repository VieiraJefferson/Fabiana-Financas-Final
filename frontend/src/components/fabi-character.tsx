"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FabiCharacterProps {
  size?: "small" | "medium" | "large";
  animation?: "idle" | "wave" | "bounce" | "thinking" | "celebrating" | "none";
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  onClick?: () => void;
  useRealImage?: boolean; // Para usar a imagem real da Fabi
  imageSrc?: string; // Caminho para a imagem da Fabi
  mood?: "normal" | "happy" | "sad" | "very-sad"; // Nova prop para humor da Fabi
  context?: "goal-achieved" | "budget-warning" | "budget-danger" | "normal"; // Contexto financeiro
  disableAnimation?: boolean; // Para desabilitar completamente as animações
}

export function FabiCharacter({
  size = "medium",
  animation = "idle",
  showSpeechBubble = false,
  speechText = "Olá! Como posso ajudar?",
  className,
  onClick,
  useRealImage = true,
  imageSrc = "/fabi-character.png",
  mood = "normal",
  context = "normal",
  disableAnimation = false
}: FabiCharacterProps) {
  const [currentAnimation, setCurrentAnimation] = useState(animation);

  // Determine image source based on mood
  const getImageSrc = () => {
    if (!useRealImage) return imageSrc;
    
    switch (mood) {
      case "happy":
        return "/fabi-happy.png";
      case "sad":
        return "/fabi-sad.png";
      case "very-sad":
        return "/fabi-very-sad.png";
      default:
        return imageSrc;
    }
  };

  // Get contextual messages based on financial context
  const getContextualMessage = () => {
    switch (context) {
      case "goal-achieved":
        return "Parabéns! Você alcançou sua meta! 🎉✨";
      case "budget-warning":
        return "Atenção! Seus gastos estão aumentando... 😟";
      case "budget-danger":
        return "Cuidado! Você está gastando muito! 😰💸";
      default:
        return speechText || "Olá! Como posso ajudar?";
    }
  };

  // Auto-determine mood based on context if not explicitly set
  const getCurrentMood = () => {
    if (mood !== "normal") return mood;
    
    switch (context) {
      case "goal-achieved":
        return "happy";
      case "budget-warning":
        return "sad";
      case "budget-danger":
        return "very-sad";
      default:
        return "normal";
    }
  };

  const currentMood = getCurrentMood();
  const contextualMessage = getContextualMessage();
  const currentImageSrc = getImageSrc();

  // Auto-cycle through idle animations
  useEffect(() => {
    if (disableAnimation || animation === "none") {
      setCurrentAnimation("none");
      return;
    }
    
    if (animation === "idle") {
      const animations = ["idle", "wave", "thinking"];
      const interval = setInterval(() => {
        setCurrentAnimation(animations[Math.floor(Math.random() * animations.length)]);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setCurrentAnimation(animation);
    }
  }, [animation, disableAnimation]);

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32"
  };

  const animationClasses = {
    idle: "",
    wave: "animate-fabi-wave",
    bounce: "animate-fabi-bounce",
    thinking: "animate-fabi-thinking",
    celebrating: "animate-fabi-bounce",
    none: ""
  };

  return (
    <div className={cn("fabi-character-container", { 'show-bubble': showSpeechBubble }, className)}>
      {/* Speech Bubble */}
      <div className="fabi-speech-bubble">
        {contextualMessage}
      </div>

      {/* Character Container */}
      <div
        className="relative cursor-pointer"
        onClick={onClick}
      >
        {/* Real Fabi Image or SVG Fallback */}
        {useRealImage ? (
          <div className={cn("relative", sizeClasses[size])}>
            <img
              src={currentImageSrc}
              alt="Fabi - Mentora Financeira"
              className={cn(
                "w-full h-full object-contain fabi-character-image",
                !disableAnimation && animationClasses[currentAnimation]
              )}
              onError={(e) => {
                // Fallback to SVG if image fails to load
                e.currentTarget.style.display = 'none';
                const svgElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (svgElement) {
                  svgElement.classList.remove('hidden');
                }
              }}
            />
            
            {/* SVG Fallback (hidden by default) */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full absolute inset-0 hidden"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fdbcb4" />
                  <stop offset="100%" stopColor="#f4a6a0" />
                </linearGradient>
                <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b4513" />
                  <stop offset="100%" stopColor="#654321" />
                </linearGradient>
              </defs>

              {/* Background Circle */}
              <circle cx="100" cy="100" r="90" fill="url(#backgroundGradient)" className="drop-shadow-lg" />
              
              {/* Hair */}
              <ellipse cx="100" cy="70" rx="35" ry="25" fill="url(#hairGradient)" />
              <ellipse cx="85" cy="65" rx="15" ry="20" fill="url(#hairGradient)" />
              <ellipse cx="115" cy="65" rx="15" ry="20" fill="url(#hairGradient)" />

              {/* Face */}
              <ellipse cx="100" cy="90" rx="30" ry="35" fill="url(#skinGradient)" />

              {/* Eyes */}
              <ellipse cx="92" cy="85" rx="3" ry="4" fill="#333" />
              <ellipse cx="108" cy="85" rx="3" ry="4" fill="#333" />
              <ellipse cx="93" cy="84" rx="1" ry="1" fill="#fff" />
              <ellipse cx="109" cy="84" rx="1" ry="1" fill="#fff" />

              {/* Eyebrows */}
              <path d="M 88 80 Q 92 78 96 80" stroke="#654321" strokeWidth="2" fill="none" />
              <path d="M 104 80 Q 108 78 112 80" stroke="#654321" strokeWidth="2" fill="none" />

              {/* Nose */}
              <ellipse cx="100" cy="92" rx="1.5" ry="2" fill="#f4a6a0" />

              {/* Mouth */}
              <path d="M 95 98 Q 100 102 105 98" stroke="#ff6b6b" strokeWidth="2" fill="none" />

              {/* Cheeks */}
              <ellipse cx="82" cy="95" rx="4" ry="3" fill="#ff9999" opacity="0.5" />
              <ellipse cx="118" cy="95" rx="4" ry="3" fill="#ff9999" opacity="0.5" />

              {/* Body */}
              <ellipse cx="100" cy="140" rx="25" ry="30" fill="hsl(var(--primary))" />

              {/* Arms */}
              <ellipse cx="75" cy="135" rx="8" ry="20" fill="url(#skinGradient)" />
              <ellipse cx="125" cy="135" rx="8" ry="20" fill="url(#skinGradient)" />

              {/* Hands */}
              <circle cx="75" cy="150" r="6" fill="url(#skinGradient)" />
              <circle cx="125" cy="150" r="6" fill="url(#skinGradient)" />
            </svg>

            {/* Animation Overlays for Real Image */}
            {currentAnimation === "thinking" && (
              <div className="absolute -top-4 -right-4">
                <div className="animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                  <div className="w-5 h-5 bg-white rounded-full opacity-80 mt-1 ml-2"></div>
                  <div className="w-8 h-8 bg-white rounded-full opacity-80 mt-1 ml-4 flex items-center justify-center text-xs">
                    💡
                  </div>
                </div>
              </div>
            )}

            {currentAnimation === "celebrating" && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 text-lg animate-bounce">✨</div>
                <div className="absolute top-4 right-2 text-lg animate-bounce" style={{ animationDelay: "0.2s" }}>⭐</div>
                <div className="absolute bottom-8 left-4 text-lg animate-bounce" style={{ animationDelay: "0.4s" }}>🎉</div>
                <div className="absolute bottom-6 right-4 text-lg animate-bounce" style={{ animationDelay: "0.6s" }}>✨</div>
              </div>
            )}
          </div>
        ) : (
          /* Original SVG Character */
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="url(#backgroundGradient)"
              className="drop-shadow-lg"
            />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="backgroundGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="skinGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdbcb4" />
                <stop offset="100%" stopColor="#f4a6a0" />
              </linearGradient>
              <linearGradient id="hairGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b4513" />
                <stop offset="100%" stopColor="#654321" />
              </linearGradient>
            </defs>

            {/* Hair */}
            <ellipse cx="100" cy="70" rx="35" ry="25" fill="url(#hairGradient2)" />
            <ellipse cx="85" cy="65" rx="15" ry="20" fill="url(#hairGradient2)" />
            <ellipse cx="115" cy="65" rx="15" ry="20" fill="url(#hairGradient2)" />

            {/* Face */}
            <ellipse cx="100" cy="90" rx="30" ry="35" fill="url(#skinGradient2)" />

            {/* Eyes */}
            <ellipse cx="92" cy="85" rx="3" ry="4" fill="#333" />
            <ellipse cx="108" cy="85" rx="3" ry="4" fill="#333" />
            <ellipse cx="93" cy="84" rx="1" ry="1" fill="#fff" />
            <ellipse cx="109" cy="84" rx="1" ry="1" fill="#fff" />

            {/* Eyebrows */}
            <path d="M 88 80 Q 92 78 96 80" stroke="#654321" strokeWidth="2" fill="none" />
            <path d="M 104 80 Q 108 78 112 80" stroke="#654321" strokeWidth="2" fill="none" />

            {/* Nose */}
            <ellipse cx="100" cy="92" rx="1.5" ry="2" fill="#f4a6a0" />

            {/* Mouth */}
            {currentAnimation === "celebrating" ? (
              <ellipse cx="100" cy="100" rx="8" ry="6" fill="#ff6b6b" />
            ) : (
              <path d="M 95 98 Q 100 102 105 98" stroke="#ff6b6b" strokeWidth="2" fill="none" />
            )}

            {/* Cheeks */}
            <ellipse cx="82" cy="95" rx="4" ry="3" fill="#ff9999" opacity="0.5" />
            <ellipse cx="118" cy="95" rx="4" ry="3" fill="#ff9999" opacity="0.5" />

            {/* Body */}
            <ellipse cx="100" cy="140" rx="25" ry="30" fill="hsl(var(--primary))" />

            {/* Arms */}
            {currentAnimation === "wave" ? (
              <>
                <ellipse cx="75" cy="130" rx="8" ry="20" fill="url(#skinGradient2)" transform="rotate(-30 75 130)" />
                <ellipse cx="125" cy="120" rx="8" ry="20" fill="url(#skinGradient2)" transform="rotate(45 125 120)" />
              </>
            ) : (
              <>
                <ellipse cx="75" cy="135" rx="8" ry="20" fill="url(#skinGradient2)" />
                <ellipse cx="125" cy="135" rx="8" ry="20" fill="url(#skinGradient2)" />
              </>
            )}

            {/* Hands */}
            <circle cx="75" cy="150" r="6" fill="url(#skinGradient2)" />
            <circle cx="125" cy="150" r="6" fill="url(#skinGradient2)" />

            {/* Thinking bubble (only for thinking animation) */}
            {currentAnimation === "thinking" && (
              <g>
                <circle cx="130" cy="70" r="3" fill="#fff" opacity="0.8" />
                <circle cx="140" cy="60" r="5" fill="#fff" opacity="0.8" />
                <circle cx="155" cy="50" r="8" fill="#fff" opacity="0.8" />
                <text x="155" y="55" textAnchor="middle" fontSize="8" fill="#666">💡</text>
              </g>
            )}

            {/* Celebration sparkles (only for celebrating animation) */}
            {currentAnimation === "celebrating" && (
              <g>
                <text x="70" y="60" fontSize="12" fill="#ffd700">✨</text>
                <text x="130" y="65" fontSize="12" fill="#ffd700">⭐</text>
                <text x="60" y="100" fontSize="12" fill="#ffd700">🎉</text>
                <text x="140" y="105" fontSize="12" fill="#ffd700">✨</text>
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}

// Tutorial Component
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface FabiTutorialProps {
  steps: TutorialStep[];
  isVisible: boolean;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function FabiTutorial({
  steps,
  isVisible,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete
}: FabiTutorialProps) {
  if (!isVisible || currentStep >= steps.length) return null;

  console.log("🎓 FabiTutorial renderizando:", { isVisible, currentStep, stepsLength: steps.length });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
        {/* Fabi Character */}
        <div className="flex justify-center mb-4">
          <FabiCharacter 
            size="medium" 
            animation="idle"
            showSpeechBubble={false}
          />
        </div>

        {/* Tutorial Content */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
          <p className="text-muted-foreground">{step.description}</p>

          {/* Progress */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full",
                  index === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Pular tutorial
            </button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={onPrevious}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  Anterior
                </button>
              )}
              
              <button
                onClick={isLastStep ? onComplete : onNext}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {isLastStep ? "Finalizar" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes específicos para contextos financeiros
interface FabiFinancialFeedbackProps {
  onClose?: () => void;
  className?: string;
}

// Fabi Parabéns - Meta Alcançada
export function FabiGoalAchieved({ onClose, className }: FabiFinancialFeedbackProps) {
  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 flex items-center justify-center", className)}>
      <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center space-y-4">
          <FabiCharacter 
            size="large" 
            mood="happy"
            context="goal-achieved"
            animation="celebrating"
            showSpeechBubble={false}
          />
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">🎉 Parabéns!</h3>
            <p className="text-muted-foreground">
              Você alcançou sua meta financeira! Continue assim e seus sonhos se tornarão realidade!
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Obrigado, Fabi! ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fabi Preocupada - Alerta de Orçamento
export function FabiBudgetWarning({ onClose, className }: FabiFinancialFeedbackProps) {
  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 flex items-center justify-center", className)}>
      <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center space-y-4">
          <FabiCharacter 
            size="large" 
            mood="sad"
            context="budget-warning"
            animation="thinking"
            showSpeechBubble={false}
          />
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-orange-600">⚠️ Atenção!</h3>
            <p className="text-muted-foreground">
              Seus gastos estão aumentando este mês. Que tal revisarmos seu orçamento juntos?
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Entendi
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Ver Relatórios 📊
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fabi Muito Preocupada - Perigo no Orçamento
export function FabiBudgetDanger({ onClose, className }: FabiFinancialFeedbackProps) {
  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 flex items-center justify-center", className)}>
      <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center space-y-4">
          <FabiCharacter 
            size="large" 
            mood="very-sad"
            context="budget-danger"
            animation="thinking"
            showSpeechBubble={false}
          />
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-red-600">🚨 Cuidado!</h3>
            <p className="text-muted-foreground">
              Você está gastando muito mais do que deveria! Preciso te ajudar a reorganizar suas finanças urgentemente.
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Depois
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Ajuda Urgente! 🆘
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para gerenciar feedback financeiro
export function useFabiFinancialFeedback() {
  const [activeModal, setActiveModal] = useState<"goal" | "warning" | "danger" | null>(null);

  const showGoalAchieved = () => setActiveModal("goal");
  const showBudgetWarning = () => setActiveModal("warning");
  const showBudgetDanger = () => setActiveModal("danger");
  const closeModal = () => setActiveModal(null);

  // Função para analisar situação financeira e mostrar feedback apropriado
  const analyzeBudgetStatus = (spent: number, budget: number, goalProgress?: number) => {
    // Meta alcançada
    if (goalProgress && goalProgress >= 100) {
      showGoalAchieved();
      return;
    }

    // Análise de orçamento
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 90) {
      showBudgetDanger();
    } else if (percentage >= 75) {
      showBudgetWarning();
    }
  };

  return {
    activeModal,
    showGoalAchieved,
    showBudgetWarning,
    showBudgetDanger,
    closeModal,
    analyzeBudgetStatus,
    // Componentes para renderizar
    GoalAchievedModal: activeModal === "goal" ? FabiGoalAchieved : null,
    BudgetWarningModal: activeModal === "warning" ? FabiBudgetWarning : null,
    BudgetDangerModal: activeModal === "danger" ? FabiBudgetDanger : null,
  };
} 