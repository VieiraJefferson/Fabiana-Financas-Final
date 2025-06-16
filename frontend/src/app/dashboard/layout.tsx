"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { FabiTutorial } from "@/components/fabi-character";
import { FabiAssistant } from "@/components/fabi-assistant";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { useFabiTutorial } from "@/hooks/use-fabi-tutorial";
import { ToastProvider } from "@/components/ui/toast-provider";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PlusCircle, 
  AreaChart, 
  GraduationCap, 
  Clapperboard, 
  Target, 
  BookHeart, 
  HelpCircle,
  ShieldCheck,
  PanelLeft,
  User,
  LogOut,
  Menu,
  X,
  DollarSign
} from "lucide-react";
import Footer from "@/components/layout/Footer";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/dashboard/transacoes", icon: ArrowRightLeft },
  { name: "Nova Transação", href: "/dashboard/nova-transacao", icon: PlusCircle },
  { name: "Orçamentos", href: "/dashboard/orcamentos", icon: DollarSign },
  { name: "Relatórios", href: "/dashboard/relatorios", icon: AreaChart },
  { name: "Mentoria", href: "/dashboard/mentoria", icon: GraduationCap },
  { name: "Conteúdo", href: "/dashboard/conteudo", icon: Clapperboard },
  { name: "Metas", href: "/dashboard/metas", icon: Target },
];

const helpItems = [
  { name: "Tutorial da Fabi", action: "tutorial", icon: BookHeart, description: "Aprenda a usar a plataforma" },
  { name: "Central de Ajuda", href: "/dashboard/ajuda", icon: HelpCircle, description: "FAQ e suporte" },
];

// Componente de navegação reutilizável para desktop e mobile
const NavigationLinks = ({ 
  onClick = () => {}, 
  restartTutorial, 
  pathname, 
  session 
}: { 
  onClick?: () => void; 
  restartTutorial: () => void; 
  pathname: string; 
  session: any;
}) => {
  const router = useRouter();

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
    onClick(); // Call onClick immediately instead of waiting for promise
  };

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => handleNavigation(item.href, e)}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </a>
        );
      })}
      
      {/* Help Section */}
      <div className="pt-4">
        <div className="px-2 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ajuda
          </h3>
        </div>
        {helpItems.map((item) => {
          const Icon = item.icon;
          if (item.action === "tutorial") {
            return (
              <button
                key={item.name}
                onClick={() => {
                  restartTutorial();
                  onClick();
                }}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors text-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="text-left">
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </button>
            );
          }
          
          const isActive = pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href!}
              onClick={(e) => handleNavigation(item.href!, e)}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <div className="text-left">
                <div>{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </a>
          );
        })}
      </div>
      
      {/* Admin Panel Link - Only for admins */}
      {session?.user?.isAdmin && (
        <>
          <div className="border-t my-2"></div>
          <a
            href="/admin"
            onClick={(e) => handleNavigation('/admin', e)}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname.startsWith('/admin')
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShieldCheck className="mr-3 h-5 w-5" />
            Painel Admin
          </a>
        </>
      )}
    </nav>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Fabi Tutorial
  const {
    isVisible: tutorialVisible,
    currentStep,
    dashboardSteps,
    startTutorial,
    restartTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    isCompleted
  } = useFabiTutorial();

  // Start tutorial for new users (only on first experience)
  useEffect(() => {
    if (session && !isCompleted && pathname === "/dashboard") {
      // Check if this is truly the first time
      const hasEverSeenTutorial = localStorage.getItem("fabi-tutorial-ever-shown");
      
      if (!hasEverSeenTutorial) {
        const timer = setTimeout(() => {
          startTutorial();
          localStorage.setItem("fabi-tutorial-ever-shown", "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [session, isCompleted, pathname, startTutorial]);

  // Fecha o drawer quando a rota muda em dispositivos móveis
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar - Visível apenas em md e acima */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg border-r hidden md:flex md:flex-col">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b px-4">
              <img 
                src="/logo3.png" 
                alt="Fabi Finanças" 
                className="h-24 w-auto"
              />
            </div>

            {/* Navigation */}
            <NavigationLinks 
              restartTutorial={restartTutorial}
              pathname={pathname}
              session={session}
            />

            {/* User Info */}
            <div className="border-t p-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - Sheet do shadcn/ui */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-[85%] max-w-[300px] sm:max-w-[350px] p-0">
            <SheetHeader className="p-4 border-b">
              <div className="flex justify-center">
                <img 
                  src="/logo3.png" 
                  alt="Fabi Finanças" 
                  className="h-10 w-auto"
                />
              </div>
            </SheetHeader>
            <div className="flex flex-col h-full">
              {/* Navigation */}
              <NavigationLinks 
                onClick={() => setIsOpen(false)}
                restartTutorial={restartTutorial}
                pathname={pathname}
                session={session}
              />
              
              {/* User Info */}
              <div className="border-t p-4 mt-auto">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="ml-2"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content Area */}
        <div className="flex flex-col flex-1 md:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center gap-2">
              {/* Menu Hambúrguer - Visível apenas em dispositivos móveis */}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
              
              {/* Título da página ou breadcrumb */}
              <h2 className="text-base md:text-lg font-semibold truncate">
                {navigation.find(item => item.href === pathname)?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                        {session?.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground leading-none truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/perfil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil e Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background pb-16 md:pb-0">
            {children}
          </main>
          
          {/* Footer - Hidden on mobile due to bottom nav */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </div>

        {/* Fabi Tutorial */}
        <FabiTutorial
          steps={dashboardSteps}
          isVisible={tutorialVisible}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTutorial}
          onComplete={completeTutorial}
        />

        {/* Fabi Assistant */}
        <FabiAssistant 
          context={
            pathname.includes('/transacoes') ? 'transactions' :
            pathname.includes('/metas') ? 'goals' :
            pathname.includes('/conteudo') ? 'content' :
            'dashboard'
          }
          className={
            pathname.includes('/transacoes') ? 'bottom-24 md:bottom-6 right-3 md:right-6' :
            pathname.includes('/dashboard') && !pathname.includes('/transacoes') ? 'bottom-24 md:bottom-6 right-3 md:right-6' :
            'bottom-24 md:bottom-6 right-3 md:right-6'
          }
        />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </ToastProvider>
  );
} 