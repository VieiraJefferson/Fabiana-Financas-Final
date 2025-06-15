"use client";

import { useState, useEffect, ReactElement, useCallback } from "react";
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
  FabiGoalAchieved, 
  FabiBudgetWarning, 
  FabiBudgetDanger, 
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
  Home
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [filters, setFilters] = useState({
    period: "this-year",
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (searchParams.get("loggedin") === "true") {
      toast.success("Login realizado com sucesso!");
      toast.success("Bem-vindo de volta! Vamos cuidar das suas finanças juntos!");
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

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

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!session || !filters.dateRange.from || !filters.dateRange.to) return;

      setLoading(true);
      setError("");

      try {
        const headers = getAuthHeaders();
        if (!headers) throw new Error("Usuário não autenticado.");

        const params = new URLSearchParams({
          startDate: filters.dateRange.from.toISOString(),
          endDate: filters.dateRange.to.toISOString(),
        });

        const [summaryResponse, transactionsResponse] = await Promise.all([
          axios.get(`/api/transactions/summary?${params.toString()}`, { headers }),
          axios.get('/api/transactions?limit=5&page=1', { headers })
        ]);
        
        const summary = summaryResponse.data;
        const transactions = transactionsResponse.data.transactions;

        setFinancialData({
          saldo: summary.saldo || 0,
          receitas: summary.totalReceitas || 0,
          despesas: summary.totalDespesas || 0,
          transacoes: transactions.map((t: any) => ({
            id: t._id,
            tipo: t.type,
            descricao: t.description,
            valor: t.amount,
            data: t.date,
            categoria: t.category
          }))
        });

      } catch (err: any) {
        console.error("Erro ao buscar dados financeiros:", err);
        setError("Não foi possível carregar os dados financeiros. Tente atualizar a página.");
        toast.error("Erro ao carregar dados financeiros.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [session, getAuthHeaders, toast, filters]);

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

  const handleNavigateToNewTransaction = () => {
    toast.info("Redirecionando para nova transação...");
    router.push("/dashboard/nova-transacao");
  };

  const handleNavigateToTransactions = () => {
    toast.info("Carregando suas transações...");
    router.push("/dashboard/transacoes");
  };

  const handleNavigateToReports = () => {
    toast.info("Preparando seus relatórios...");
    router.push("/dashboard/relatorios");
  };

  const handleNavigateToMentorship = () => {
    toast.info("Acessando área de mentoria...");
    router.push("/dashboard/mentoria");
  };

  const simulateGoalAchieved = () => {
    toast.success("Parabéns! Você alcançou uma meta! 🎉");
    analyzeBudgetStatus(mockData.monthlySpent, mockData.monthlyBudget, 100);
  };

  const simulateBudgetWarning = () => {
    toast.info("Atenção! Você está gastando muito este mês. ⚠️");
    analyzeBudgetStatus(2250, 3000);
  };

  const simulateBudgetDanger = () => {
    toast.error("Cuidado! Seu orçamento está no limite! 🚨");
    analyzeBudgetStatus(2700, 3000);
  };

  if (loading || !financialData) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
        </div>
        <div>
            <Skeleton className="h-12 w-1/3 mb-4" />
            <Skeleton className="h-20 mb-2" />
            <Skeleton className="h-20 mb-2" />
            <Skeleton className="h-20 mb-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Bem-vindo(a), {session?.user?.name}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Aqui está um resumo das suas finanças e atividades recentes.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Visão Geral</CardTitle>
            <CardDescription>Ajuste o período para analisar suas finanças.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row flex-wrap items-start md:items-end gap-4">
            <div className="w-full md:w-auto space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={filters.period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full md:w-[180px]">
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
              <div className="w-full md:w-auto space-y-2">
                <Label>Intervalo Personalizado</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
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
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-md text-red-600 dark:text-red-400">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>🧪 Testar Feedback da Fabi</CardTitle>
            <CardDescription>
              Clique nos botões para ver como a Fabi reage a diferentes situações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={simulateGoalAchieved} className="bg-green-600 hover:bg-green-700">
              🎉 Meta Alcançada
            </Button>
            <Button onClick={simulateBudgetWarning} className="bg-orange-600 hover:bg-orange-700">
              ⚠️ Alerta de Orçamento
            </Button>
            <Button onClick={simulateBudgetDanger} className="bg-red-600 hover:bg-red-700">
              🚨 Perigo no Orçamento
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(financialData.saldo)}</div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(financialData.receitas)}</div>
              <p className="text-xs text-muted-foreground">
                Total de entradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-{formatCurrency(financialData.despesas)}</div>
              <p className="text-xs text-muted-foreground">
                Total de saídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialData.receitas > 0 
                  ? `${Math.round((financialData.saldo / financialData.receitas) * 100)}%`
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Do que você ganhou
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                <span>Ações Rápidas</span>
              </CardTitle>
              <CardDescription>
                Adicione transações rapidamente
              </CardDescription>
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
              <CardDescription>
                Analise suas finanças
              </CardDescription>
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

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span>Mentoria</span>
              </CardTitle>
              <CardDescription>
                Agende sua próxima sessão e acesse conteúdo exclusivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button className="w-full">Agendar Mentoria</Button>
                <Button variant="outline" className="w-full">
                  <BookOpenCheck className="mr-2 h-4 w-4" /> Conteúdo Exclusivo
                </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Transações Recentes</span>
            </CardTitle>
            <CardDescription>
              Suas últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialData.transacoes.map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transacao.tipo === 'receita' ? 'bg-success/10' : 'bg-danger/10'
                    }`}>
                      <span className={`text-sm ${
                        transacao.tipo === 'receita' ? 'text-success' : 'text-danger'
                      }`}>
                        {getTransactionIcon(transacao.tipo, transacao.categoria)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{transacao.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {isClient && formatDate(transacao.data)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </p>
                    <p className="text-sm text-muted-foreground">{transacao.categoria}</p>
                  </div>
                </div>
              ))}

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleNavigateToTransactions}
              >
                Ver Todas as Transações
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeModal === "goal" && (
          <FabiGoalAchieved onClose={closeModal} />
        )}
        {activeModal === "warning" && (
          <FabiBudgetWarning onClose={closeModal} />
        )}
        {activeModal === "danger" && (
          <FabiBudgetDanger onClose={closeModal} />
        )}
      </main>
    </div>
  );
} 