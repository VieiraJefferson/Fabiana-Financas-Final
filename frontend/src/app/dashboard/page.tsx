"use client";

import { useState, useEffect, useMemo, useCallback, useRef, ReactElement } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  FabiCharacter, 
  FabiTutorial, 
  FabiGoalAchieved, 
  FabiBudgetWarning,
  FabiBudgetDanger,
  FabiBudgetAlert,
  useFabiFinancialFeedback 
} from "@/components/fabi-character";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Landmark, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Target, 
  Zap, 
  AreaChart, 
  GraduationCap, 
  Clock,
  PlusCircle,
  BookOpen,
  ShoppingCart,
  Car,
  HeartPulse,
  Book,
  Gamepad2,
  Tag,
  Receipt,
  CircleDollarSign,
  Calendar as CalendarIcon,
  BookOpenCheck,
  Home,
  ArrowRightLeft,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Stethoscope,
  Building,
  Wrench,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  PieChart,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, startOfMonth, endOfMonth } from "date-fns";


interface Transaction {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

interface FinancialData {
  saldo: number;
  receitas: number;
  despesas: number;
  transacoes: Transaction[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { getAuthHeaders } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeModal,
    closeModal,
    analyzeBudgetStatus
  } = useFabiFinancialFeedback();

  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref para evitar múltiplas requisições simultâneas
  const isFetchingRef = useRef(false);

  // Cache para dados financeiros
  const [cachedData, setCachedData] = useState<{[key: string]: {data: FinancialData, timestamp: number}} | null>(null);

  const [filters, setFilters] = useState({
    period: "this-year",
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
  });

  // Comentado para melhorar performance - interface aparece imediatamente
  // if (loading && !financialData) {
  //   return (
  //     <div className="min-h-screen w-full">
  //       <div className="p-3 sm:p-4 space-y-4 max-w-full">
  //         <div className="space-y-2">
  //           <Skeleton className="h-6 w-48" />
  //           <Skeleton className="h-4 w-72" />
  //         </div>
  //         <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  //           {Array.from({ length: 4 }).map((_, i) => (
  //             <Card key={i}>
  //               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //                 <Skeleton className="h-4 w-20" />
  //                 <Skeleton className="h-4 w-4 rounded" />
  //               </CardHeader>
  //               <CardContent>
  //                 <Skeleton className="h-6 w-24 mb-2" />
  //                 <Skeleton className="h-3 w-16" />
  //               </CardContent>
  //             </Card>
  //           ))}
  //         </div>
  //         <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  //           <Skeleton className="h-40" />
  //           <Skeleton className="h-40" />
  //           <Skeleton className="h-40" />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  useEffect(() => {
    setIsClient(true);
    
    // Mostrar interface após 500ms mesmo se dados não carregaram
    const quickShowTimeout = setTimeout(() => {
      if (false) { // Desabilitado para melhorar performance
        setFinancialData({
          saldo: 0,
          receitas: 0,
          despesas: 0,
          transacoes: []
        });
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(quickShowTimeout);
  }, []);

  useEffect(() => {
    if (searchParams.get("loggedin") === "true") {
      toast.success("Login realizado com sucesso!");
      toast.success("Bem-vindo de volta! Vamos cuidar das suas finanças juntos!");
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  const fetchFinancialData = async () => {
    if (!session) return;
    
    try {
      setIsRefreshing(true);
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error("Usuário não autenticado.");
      }

      // Preparar parâmetros de data
      const params = new URLSearchParams();
      if (filters.dateRange.from) {
        params.append('startDate', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        params.append('endDate', filters.dateRange.to.toISOString());
      }

      // Buscar dados financeiros
      const { data } = await axios.get(`/api/transactions/summary?${params.toString()}`, { headers });
      
      // Buscar dados de orçamento
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      try {
        const budgetResponse = await axios.get(`/api/budgets/summary?month=${currentMonth}&year=${currentYear}`, { headers });
        setBudgetSummary(budgetResponse.data);
      } catch (budgetError) {
        console.log("Nenhum orçamento encontrado, usando valores padrão");
        setBudgetSummary(null);
      }

      setFinancialData(data);
      setError("");
    } catch (err: any) {
      console.error("Erro ao buscar dados financeiros:", err);
      setError("Não foi possível carregar os dados financeiros.");
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // useEffect mais simples que só executa uma vez
  useEffect(() => {
    if (session) {
      fetchFinancialData();
    }
  }, [session?.user?.id]); // Apenas quando o usuário muda

  const handlePeriodChange = useCallback((period: string) => {
    const now = new Date();
    let from = now;
    let to = now;

    switch (period) {
      case "this-month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "last-month":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this-year":
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
    }
    setFilters({ period, dateRange: { from, to } });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} dias atrás`;
    }
  };

  const getTransactionIcon = (tipo: string, categoria: string): ReactElement => {
    const iconProps = { className: "h-5 w-5" };

    if (tipo === 'receita') return <CircleDollarSign {...iconProps} />;
    
    const icons: { [key: string]: ReactElement } = {
      'Alimentação': <ShoppingCart {...iconProps} />,
      'Transporte': <Car {...iconProps} />,
      'Moradia': <Home {...iconProps} />,
      'Saúde': <HeartPulse {...iconProps} />,
      'Educação': <Book {...iconProps} />,
      'Lazer': <Gamepad2 {...iconProps} />,
      'Compras': <Tag {...iconProps} />,
      'Contas': <Receipt {...iconProps} />,
      'Trabalho': <CircleDollarSign {...iconProps} />,
    };
    
    return icons[categoria] || <CircleDollarSign {...iconProps} />;
  };

  const mockData = {
    currentBalance: 2500,
    monthlyBudget: 3000,
    monthlySpent: 2800,
    goalProgress: 85,
    goalTarget: 5000,
    goalCurrent: 4250
  };

  // Memoized navigation handlers for better performance
  const handleNavigateToNewTransaction = useCallback(() => {
    router.push("/dashboard/nova-transacao");
  }, [router]);

  const handleNavigateToTransactions = useCallback(() => {
    router.push("/dashboard/transacoes");
  }, [router]);

  const handleNavigateToReports = useCallback(() => {
    router.push("/dashboard/relatorios");
  }, [router]);

  const handleNavigateToMentorship = useCallback(() => {
    router.push("/dashboard/mentoria");
  }, [router]);

  // Memoized financial calculations
  const financialSummary = useMemo(() => {
    if (!financialData) {
      return {
        saldo: 0,
        receitas: 0,
        despesas: 0,
        economyRate: 0
      };
    }
    return {
      saldo: financialData.saldo,
      receitas: financialData.receitas,
      despesas: financialData.despesas,
      economyRate: financialData.receitas > 0 
        ? Math.round((financialData.saldo / financialData.receitas) * 100)
        : 0
    };
  }, [financialData]);

  // Memoized recent transactions
  const recentTransactions = useMemo(() => {
    if (!financialData || !financialData.transacoes) return [];
    return financialData.transacoes
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [financialData]);

  const simulateGoalAchieved = () => {
    toast.success("Parabéns! Você alcançou uma meta! 🎉");
    analyzeBudgetStatus(mockData.monthlySpent, mockData.monthlyBudget);
  };

  const simulateBudgetWarning = () => {
    toast.info("Atenção! Você está gastando muito este mês. ⚠️");
    analyzeBudgetStatus(2250, 3000);
  };

  const simulateBudgetDanger = () => {
    toast.error("Cuidado! Seu orçamento está no limite! 🚨");
    analyzeBudgetStatus(2700, 3000);
  };

  // Se não temos dados, mostrar dados padrão
  const displayData = financialData || {
    saldo: 0,
    receitas: 0,
    despesas: 0,
    transacoes: []
  };

  // Função para calcular status do orçamento (memoizada)
  const budgetStatus = useMemo(() => {
    if (!financialData) return null;
    
    // Usar dados reais de orçamento se disponíveis
    if (budgetSummary && budgetSummary.totals) {
      return {
        budget: budgetSummary.totals.budgeted,
        spent: budgetSummary.totals.spent,
        remaining: budgetSummary.totals.remaining,
        percentage: budgetSummary.totals.percentage,
        status: budgetSummary.totals.status
      };
    }
    
    // Fallback para orçamento padrão se não houver orçamentos configurados
    const monthlyBudget = 3000;
    const currentSpent = financialData.despesas;
    const percentage = (currentSpent / monthlyBudget) * 100;
    const remaining = monthlyBudget - currentSpent;
    
    return {
      budget: monthlyBudget,
      spent: currentSpent,
      remaining,
      percentage: Math.min(percentage, 100),
      status: percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'safe'
    };
  }, [financialData, budgetSummary]);

  // Funções de exportação de dados
  const exportToCSV = (data: FinancialData, period: string) => {
    const csvContent = [
      // Cabeçalho
      ['Tipo', 'Descrição', 'Valor', 'Data', 'Categoria'].join(','),
      // Dados das transações
      ...(data.transacoes || []).map(t => [
        t.tipo,
        `"${t.descricao}"`,
        t.valor.toString(),
        t.data,
        `"${t.categoria}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fabiana-financas-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (data: FinancialData, period: string) => {
    // Criar conteúdo HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório Financeiro - Fabiana Finanças</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .transactions { width: 100%; border-collapse: collapse; }
          .transactions th, .transactions td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .transactions th { background-color: #4f46e5; color: white; }
          .receita { color: #16a34a; }
          .despesa { color: #dc2626; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <h2>Fabiana Finanças</h2>
          <p>Período: ${period} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="summary">
          <h3>Resumo Financeiro</h3>
          <p><strong>Saldo Total:</strong> R$ ${data.saldo.toFixed(2).replace('.', ',')}</p>
          <p><strong>Total de Receitas:</strong> R$ ${data.receitas.toFixed(2).replace('.', ',')}</p>
          <p><strong>Total de Despesas:</strong> R$ ${data.despesas.toFixed(2).replace('.', ',')}</p>
          <p><strong>Total de Transações:</strong> ${(data.transacoes || []).length}</p>
        </div>

        <h3>Detalhamento das Transações</h3>
        <table class="transactions">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${(data.transacoes || []).map(t => `
              <tr>
                <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
                <td class="${t.tipo}">${t.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
                <td>${t.descricao}</td>
                <td>${t.categoria}</td>
                <td class="${t.tipo}">R$ ${t.valor.toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo sistema Fabiana Finanças</p>
          <p>Para mais informações, acesse nossa plataforma</p>
        </div>
      </body>
      </html>
    `;

    // Criar e baixar PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Handlers para exportação
  const handleExportCSV = () => {
    if (!financialData || !financialData.transacoes || financialData.transacoes.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    const periodLabel = filters.period === 'this-month' ? 'este-mes' : 
                       filters.period === 'last-month' ? 'mes-passado' : 
                       filters.period === 'this-year' ? 'este-ano' : 'personalizado';
    
    exportToCSV(financialData, periodLabel);
    toast.success("Dados exportados para CSV com sucesso! 📊");
  };

  const handleExportPDF = () => {
    if (!financialData || !financialData.transacoes || financialData.transacoes.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    const periodLabel = filters.period === 'this-month' ? 'Este Mês' : 
                       filters.period === 'last-month' ? 'Mês Passado' : 
                       filters.period === 'this-year' ? 'Este Ano' : 'Período Personalizado';
    
    exportToPDF(financialData, periodLabel);
    toast.success("Relatório PDF gerado com sucesso! 📄");
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="w-full max-w-full overflow-x-hidden">
        {/* Mobile Header - Otimizado para mobile first */}
        <div className="md:hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                Olá, {session?.user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm opacity-90 truncate">Como estão suas finanças hoje?</p>
            </div>
          </div>

          {/* Saldo Principal - Destaque */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-sm opacity-80 mb-1">Saldo Total</p>
            <p className="text-2xl sm:text-3xl font-bold mb-3 break-words">{formatCurrency(displayData.saldo)}</p>
            
            {/* Quick Stats Inline */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-1">
                <ArrowUpCircle className="h-4 w-4 text-green-300 flex-shrink-0" />
                <span className="opacity-80">Receitas:</span>
                <span className="font-semibold text-green-300 truncate">
                  {formatCurrency(displayData.receitas)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ArrowDownCircle className="h-4 w-4 text-red-300 flex-shrink-0" />
                <span className="opacity-80">Despesas:</span>
                <span className="font-semibold text-red-300 truncate">
                  {formatCurrency(displayData.despesas)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo(a), {session?.user?.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo das suas finanças e atividades recentes.
          </p>
        </div>

        <div className="p-3 sm:p-4 space-y-4 max-w-full overflow-x-hidden">
          {/* Desktop Period Filter */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
              <CardDescription>Ajuste o período para analisar suas finanças.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select value={filters.period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Este Mês</SelectItem>
                    <SelectItem value="last-month">Mês Passado</SelectItem>
                    <SelectItem value="this-year">Este Ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filters.period === 'custom' && (
                <div className="space-y-2">
                  <Label>Intervalo Personalizado</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from && filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "PPP", { locale: ptBR })} - {format(filters.dateRange.to, "PPP", { locale: ptBR })}
                          </>
                        ) : (
                          <span>Escolha um intervalo</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setFilters(prev => ({ ...prev, dateRange: { from: range.from!, to: range.to! } }));
                            setIsCalendarOpen(false);
                          }
                        }}
                        numberOfMonths={2}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              {/* Botões de Exportação */}
              <div className="space-y-2">
                <Label>Exportar Dados</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-md text-red-600 dark:text-red-400">
              <p className="font-medium">{error}</p>
            </div>
          )}



          {/* Cards de Estatísticas - Desktop */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(displayData.saldo)}</div>
                <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{formatCurrency(displayData.receitas)}</div>
                <p className="text-xs text-muted-foreground">Total de entradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-{formatCurrency(displayData.despesas)}</div>
                <p className="text-xs text-muted-foreground">Total de saídas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayData.receitas > 0
                    ? `${Math.round((displayData.saldo / displayData.receitas) * 100)}%`
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Do que você ganhou</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerta de Orçamento - Responsivo */}
          {budgetStatus && budgetStatus.status !== 'safe' && (
            <FabiBudgetAlert
              budgetStatus={budgetStatus}
              onViewExpenses={() => router.push('/dashboard/transacoes')}
              onViewReports={() => router.push('/dashboard/relatorios')}
            />
          )}

          {/* Mobile Quick Actions Grid - Redesigned like the reference */}
          <div className="md:hidden space-y-4">
            {/* Resumo Financeiro Visual */}
            <div>
              <h2 className="text-lg font-semibold mb-3 px-1">Resumo do Mês</h2>
              <div className="grid grid-cols-1 gap-3">
                {/* Card de Economia/Meta */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Taxa de Economia</h3>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">Do que você ganhou</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {displayData.receitas > 0
                            ? `${Math.round((displayData.saldo / displayData.receitas) * 100)}%`
                            : '0%'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cards de Receitas e Despesas lado a lado */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                          <ArrowUpCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 mb-1">Receitas</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 truncate">
                          {formatCurrency(displayData.receitas)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-2 bg-red-500 rounded-full flex items-center justify-center">
                          <ArrowDownCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-xs text-red-700 dark:text-red-300 mb-1">Despesas</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 truncate">
                          {formatCurrency(displayData.despesas)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>



            {/* Seção de Ações Rápidas */}
            <div>
              <h2 className="text-lg font-semibold mb-3 px-1">Ações Rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <PlusCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">Nova Transação</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">Adicionar receita ou despesa</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs h-8"
                      onClick={handleNavigateToNewTransaction}
                    >
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">Transações</h3>
                    <p className="text-xs text-green-700 dark:text-green-300 mb-3">Ver todas as movimentações</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white text-xs h-8"
                      onClick={handleNavigateToTransactions}
                    >
                      Ver Todas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Seção de Análises */}
            <div>
              <h2 className="text-lg font-semibold mb-3 px-1">Análises</h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                      <AreaChart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-1">Relatórios</h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">Análise detalhada dos gastos</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white text-xs h-8"
                      onClick={handleNavigateToReports}
                    >
                      Visualizar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-orange-900 dark:text-orange-100 mb-1">Mentoria</h3>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">Agendar sessão de orientação</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white text-xs h-8"
                      onClick={handleNavigateToMentorship}
                    >
                      Agendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Seção de Exportação - Mobile */}
            <div>
              <h2 className="text-lg font-semibold mb-3 px-1">Exportar Dados</h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">Planilha CSV</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">Dados para Excel/Sheets</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white text-xs h-8"
                      onClick={handleExportCSV}
                    >
                      Baixar CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-1">Relatório PDF</h3>
                    <p className="text-xs text-red-700 dark:text-red-300 mb-3">Documento completo</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-500 hover:text-white text-xs h-8"
                      onClick={handleExportPDF}
                    >
                      Gerar PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Desktop Cards Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5" />
                  <span>Ações Rápidas</span>
                </CardTitle>
                <CardDescription>Adicione transações rapidamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full flex items-center justify-center"
                  onClick={handleNavigateToNewTransaction}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleNavigateToTransactions}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Ver Todas as Transações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AreaChart className="h-5 w-5" />
                  <span>Relatórios</span>
                </CardTitle>
                <CardDescription>Analise suas finanças</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNavigateToReports}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" /> Relatório Mensal
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNavigateToReports}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" /> Análise de Gastos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Educação Financeira</span>
                </CardTitle>
                <CardDescription>Aprenda e evolua</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNavigateToMentorship}
                >
                  <BookOpenCheck className="mr-2 h-4 w-4" /> Agendar Mentoria
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/conteudo")}
                >
                  <Clock className="mr-2 h-4 w-4" /> Conteúdo Educativo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transações Recentes - Mobile optimized */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Transações Recentes
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleNavigateToTransactions}
                  className="text-primary hover:text-primary/80"
                >
                  Ver todas
                </Button>
              </div>
              <CardDescription className="hidden md:block">
                Suas últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!displayData.transacoes || displayData.transacoes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <CircleDollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma transação encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece adicionando sua primeira transação
                  </p>
                  <Button onClick={handleNavigateToNewTransaction} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Transação
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayData.transacoes.slice(0, 5).map((transacao) => (
                    <div key={transacao.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          transacao.tipo === 'receita' 
                            ? "bg-green-100 dark:bg-green-900/20" 
                            : "bg-red-100 dark:bg-red-900/20"
                        )}>
                          {getTransactionIcon(transacao.tipo, transacao.categoria)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate pr-2">{transacao.descricao}</p>
                          <p className={cn(
                            "font-bold text-sm flex-shrink-0",
                            transacao.tipo === 'receita' ? "text-green-600" : "text-red-600"
                          )}>
                            {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate pr-2">
                            {transacao.categoria}
                          </p>
                          <p className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(transacao.data)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 md:hidden">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleNavigateToTransactions}
                    >
                      Ver Todas as Transações
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Section - Hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Debug - Fabi Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={simulateGoalAchieved}>
                    Simular Meta Alcançada
                  </Button>
                  <Button size="sm" variant="outline" onClick={simulateBudgetWarning}>
                    Simular Aviso Orçamento
                  </Button>
                  <Button size="sm" variant="outline" onClick={simulateBudgetDanger}>
                    Simular Perigo Orçamento
                  </Button>
                  
                  {/* Novos botões para testar diferentes cenários */}
                  <Button size="sm" variant="outline" onClick={() => {
                    // Simular orçamento seguro (50% usado)
                    const mockSafeData = { 
                      saldo: 1500, 
                      receitas: 3000, 
                      despesas: 1500, 
                      transacoes: [] 
                    };
                    setFinancialData(mockSafeData);
                    toast.success("Simulando orçamento seguro - Fabi feliz! 😊");
                  }}>
                    Simular Orçamento Seguro
                  </Button>
                  
                  <Button size="sm" variant="outline" onClick={() => {
                    // Simular orçamento no limite (85% usado)
                    const mockWarningData = { 
                      saldo: 450, 
                      receitas: 3000, 
                      despesas: 2550, 
                      transacoes: [] 
                    };
                    setFinancialData(mockWarningData);
                    toast.warning("Simulando orçamento no limite - Fabi preocupada! 🤔");
                  }}>
                    Simular Orçamento Limite
                  </Button>
                  
                  <Button size="sm" variant="outline" onClick={() => {
                    // Simular orçamento estourado (120% usado)
                    const mockDangerData = { 
                      saldo: -600, 
                      receitas: 3000, 
                      despesas: 3600, 
                      transacoes: [] 
                    };
                    setFinancialData(mockDangerData);
                    toast.error("Simulando orçamento estourado - Fabi muito triste! 😟");
                  }}>
                    Simular Orçamento Estourado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Fabi Feedback Modals */}
      {activeModal === 'goal-achieved' && <FabiGoalAchieved onClose={closeModal} />}
      {activeModal === 'budget-warning' && <FabiBudgetWarning onClose={closeModal} />}
      {activeModal === 'budget-danger' && <FabiBudgetDanger onClose={closeModal} />}
    </div>
  );
} 