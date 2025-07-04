"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLogout } from "@/hooks/useLogout";
import { Menu, Home } from "lucide-react";
import { signOut } from "next-auth/react";

const adminNavigation = [
  {
    name: "Dashboard Admin",
    href: "/admin",
    icon: "📊",
  },
  {
    name: "Usuários",
    href: "/admin/usuarios",
    icon: "👥",
  },
  {
    name: "Vídeos",
    href: "/admin/videos",
    icon: "🎥",
  },
  {
    name: "Cursos",
    href: "/admin/cursos",
    icon: "📚",
  },
  {
    name: "Planos",
    href: "/admin/planos",
    icon: "💎",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: "📈",
  },
  {
    name: "Configurações",
    href: "/admin/configuracoes",
    icon: "⚙️",
  },
];

// Componente de navegação reutilizável para desktop e mobile
const AdminNavigationLinks = ({ 
  onClick = () => {},
  pathname,
  router
}: { 
  onClick?: () => void;
  pathname: string;
  router: any;
}) => {
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
    onClick();
  };

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {adminNavigation.map((item) => {
        const isActive = pathname === item.href;
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
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </a>
        );
      })}
    </nav>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  // Função personalizada para logout completo
  const handleLogout = async () => {
    await logout();
  };

  // Fechar drawer quando a rota muda em dispositivos móveis
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

  // Verificar se o usuário é admin
  if (!session?.user?.isAdmin) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Visível apenas em lg e acima */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg border-r hidden lg:flex lg:flex-col">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b px-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <div>
                <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Fabi Finanças</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <AdminNavigationLinks 
            pathname={pathname}
            router={router}
          />

          {/* Quick Actions */}
          <div className="border-t p-4 space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => router.push("/dashboard")}
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name ?? ""} />
                <AvatarFallback>
                  {(session?.user?.name || "A").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrador
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
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">👑</span>
              <div>
                <SheetTitle className="text-lg font-bold text-primary">Admin Panel</SheetTitle>
                <p className="text-xs text-muted-foreground">Fabi Finanças</p>
              </div>
            </div>
          </SheetHeader>
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <AdminNavigationLinks 
              onClick={() => setIsOpen(false)}
              pathname={pathname}
              router={router}
            />
            
            {/* Quick Actions */}
            <div className="border-t p-4 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  router.push("/dashboard");
                  setIsOpen(false);
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </div>
            
            {/* User Info */}
            <div className="border-t p-4 mt-auto">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name ?? ""} />
                  <AvatarFallback>
                    {(session?.user?.name || "A").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Administrador
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content Area */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex items-center gap-2">
            {/* Menu Hambúrguer - Visível apenas em dispositivos móveis */}
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            
            {/* Título da página */}
            <h2 className="text-base lg:text-lg font-semibold truncate">
              {adminNavigation.find((item) => item.href === pathname)?.name || "Admin Panel"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Admin
              </span>
              
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name ?? ""} />
                      <AvatarFallback>
                        {(session?.user?.name || "A").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard Principal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 