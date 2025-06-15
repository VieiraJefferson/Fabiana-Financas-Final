"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ArrowLeftRight, BarChart3, Settings, LifeBuoy, GraduationCap } from 'lucide-react';

const mainNav = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const secondaryNav = [
  { href: '/dashboard/mentoria', label: 'Mentoria', icon: GraduationCap },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/dashboard/ajuda', label: 'Ajuda & Suporte', icon: LifeBuoy },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const renderNav = (items: typeof mainNav) => {
    return items.map((item) => {
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            isActive && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });
  };

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="">Fabi Finanças</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {renderNav(mainNav)}
          <div className="my-4 border-t"></div>
          {renderNav(secondaryNav)}
        </nav>
      </div>
    </div>
  );
} 