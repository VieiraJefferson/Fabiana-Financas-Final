"use client";

import { useState, useEffect } from "react";
import { FabiCharacter } from "./fabi-character";
import { useFabiAssistant, useFabiTutorial } from "@/hooks/use-fabi-tutorial";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FabiAssistantProps {
  context?: "dashboard" | "transactions" | "goals" | "content";
  className?: string;
}

export function FabiAssistant({ context = "dashboard", className }: FabiAssistantProps) {
  const { isVisible, currentTip, showTip, hideTip, setIsVisible } = useFabiAssistant();
  const { isCompleted: tutorialCompleted } = useFabiTutorial();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome message only after tutorial is completed
  useEffect(() => {
    if (tutorialCompleted) {
      const hasSeenWelcome = localStorage.getItem("fabi-assistant-welcome");
      if (!hasSeenWelcome) {
        setTimeout(() => {
          setShowWelcome(true);
          localStorage.setItem("fabi-assistant-welcome", "true");
        }, 2000);
      }
    }
  }, [tutorialCompleted]);

  // Auto-show contextual tips only after tutorial is completed
  useEffect(() => {
    if (!tutorialCompleted) return;
    
    const timer = setTimeout(() => {
      if (!isVisible && !isMinimized && Math.random() > 0.7) {
        showTip(context);
      }
    }, 10000 + Math.random() * 20000); // Random between 10-30 seconds

    return () => clearTimeout(timer);
  }, [context, isVisible, isMinimized, showTip, tutorialCompleted]);

  // Don't render if tutorial is not completed
  if (!tutorialCompleted) {
    return null;
  }

  const handleFabiClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
      showTip(context);
    } else if (!isVisible) {
      showTip(context);
    } else {
      hideTip();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    hideTip();
    setShowWelcome(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    setShowWelcome(false);
  };

  return (
    <div className={cn("fixed z-40", className || "bottom-20 md:bottom-6 right-4 md:right-6")}>
      {/* Welcome Message */}
      {showWelcome && !isMinimized && (
        <div className="absolute bottom-16 md:bottom-20 right-0 mb-4 animate-in slide-in-from-bottom-4">
          <div className="bg-background border border-border rounded-lg p-4 shadow-lg max-w-xs">
            <div className="flex items-start gap-3">
              <FabiCharacter size="small" animation="wave" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-foreground mb-1">
                  Oi! Eu sou a Fabi! 👋
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Estou aqui para te ajudar com dicas financeiras personalizadas. 
                  Clique em mim quando precisar!
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowWelcome(false)}>
                    Entendi
                  </Button>
                  <Button size="sm" onClick={handleMinimize}>
                    Minimizar
                  </Button>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground text-xs p-1 hover:bg-muted rounded"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Bubble */}
      {isVisible && !isMinimized && !showWelcome && (
        <div className="absolute bottom-16 md:bottom-20 right-0 mb-4 animate-in slide-in-from-bottom-4">
          <div className="bg-background border border-border rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start gap-3">
              <FabiCharacter size="small" animation="thinking" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{currentTip}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={hideTip}>
                    Obrigado!
                  </Button>
                  <Button size="sm" onClick={() => showTip(context)}>
                    Outra dica
                  </Button>
                </div>
              </div>
              <button
                onClick={hideTip}
                className="text-muted-foreground hover:text-foreground text-xs p-1 hover:bg-muted rounded"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Fabi Button */}
      <div className="relative">
        {/* Notification Dot */}
        {!isVisible && !isMinimized && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        )}

        {/* Fabi Character Button */}
        <button
          onClick={handleFabiClick}
          className={cn(
            "relative transition-all duration-300 hover:scale-110 rounded-full p-1",
            isMinimized ? "opacity-70 hover:opacity-100" : ""
          )}
          aria-label="Assistente Fabi"
        >
          <FabiCharacter 
            size={isMinimized ? "small" : "medium"}
            animation={isVisible ? "thinking" : "idle"}
            className="drop-shadow-lg"
          />
        </button>

        {/* Quick Actions Menu */}
        {!isMinimized && !showWelcome && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => showTip(context)}
                  className="text-xs px-2 py-1 hover:bg-muted rounded text-left whitespace-nowrap"
                >
                  💡 Dica
                </button>
                <button
                  onClick={handleMinimize}
                  className="text-xs px-2 py-1 hover:bg-muted rounded text-left whitespace-nowrap"
                >
                  ➖ Minimizar
                </button>
                <button
                  onClick={handleClose}
                  className="text-xs px-2 py-1 hover:bg-muted rounded text-left whitespace-nowrap text-red-600 dark:text-red-400"
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Animation Component for Fabi
export function FabiLoader({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <FabiCharacter 
        size="large" 
        animation="thinking"
        showSpeechBubble={true}
        speechText={message}
      />
      <div className="mt-4 flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    </div>
  );
}

// Success/Celebration Component
export function FabiCelebration({ 
  message = "Parabéns! 🎉", 
  onClose 
}: { 
  message?: string; 
  onClose?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg p-8 text-center shadow-xl">
        <FabiCharacter 
          size="large" 
          animation="celebrating"
          showSpeechBubble={true}
          speechText={message}
        />
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Objetivo Alcançado! ✨
          </h3>
          <p className="text-muted-foreground text-sm">
            Continue assim e você vai longe!
          </p>
        </div>
        {onClose && (
          <Button onClick={onClose} className="mt-4">
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
} 