import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

interface FeedbackProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

const feedbackConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300",
    iconClassName: "text-green-600 dark:text-green-400"
  },
  error: {
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
    iconClassName: "text-red-600 dark:text-red-400"
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300",
    iconClassName: "text-yellow-600 dark:text-yellow-400"
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
    iconClassName: "text-blue-600 dark:text-blue-400"
  }
};

export function Feedback({ type, title, message, className, onClose }: FeedbackProps) {
  const config = feedbackConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "p-4 border rounded-lg transition-smooth",
      config.className,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClassName)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Componentes específicos para cada tipo
export function SuccessFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="success" />;
}

export function ErrorFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="error" />;
}

export function WarningFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="warning" />;
}

export function InfoFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="info" />;
} 