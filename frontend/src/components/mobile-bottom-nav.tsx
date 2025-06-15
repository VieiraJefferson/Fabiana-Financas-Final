"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  ArrowLeftRight, 
  PlusCircle, 
  BarChart3, 
  User 
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Início",
      href: "/dashboard",
    },
    {
      icon: ArrowLeftRight,
      label: "Transações",
      href: "/dashboard/transacoes",
    },
    {
      icon: PlusCircle,
      label: "Adicionar",
      href: "/dashboard/nova-transacao",
    },
    {
      icon: BarChart3,
      label: "Relatórios",
      href: "/dashboard/relatorios",
    },
    {
      icon: User,
      label: "Perfil",
      href: "/dashboard/perfil",
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 safe-area-pb">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>
      
      <div className="relative grid grid-cols-5 h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out active:scale-95 relative",
                "hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl mx-1 my-2",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full transition-all duration-300"></div>
              )}
              
              {/* Icon container */}
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300 relative",
                isActive 
                  ? "bg-primary/10 scale-110" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "scale-110"
                )} />
                
                {/* Pulse effect for active state */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse"></div>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-all duration-300 leading-none",
                isActive 
                  ? "font-semibold text-primary scale-105" 
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {item.label}
              </span>
              
              {/* Special styling for Add button */}
              {item.href === "/dashboard/nova-transacao" && (
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-t from-primary/10 to-transparent" 
                    : "hover:bg-gradient-to-t hover:from-blue-50 hover:to-transparent dark:hover:from-blue-900/20"
                )}></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Bottom safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/95 dark:bg-gray-900/95"></div>
    </div>
  );
} 