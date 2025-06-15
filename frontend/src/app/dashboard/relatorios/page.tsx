"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Download } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";


interface Transaction {
  _id: string;
  type: 'receita' | 'despesa';
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: { name: string; value: number }[];
  incomeVsExpenses: { month: string; Receitas: number; Despesas: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
};

const RelatoriosSkeleton = () => (
  <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between space-y-2">
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
    {/* Cards de Resumo */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
    </div>
    {/* Gráficos */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Skeleton className="h-[380px] rounded-lg col-span-4 lg:col-span-3" />
      <Skeleton className="h-[380px] rounded-lg col-span-4" />
    </div>
  </div>
);

export default function RelatoriosPage() {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState<'tendencias' | 'categorias'>('tendencias');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Novo estado para os filtros
  const [filters, setFilters] = useState({
    period: "this-year",
    dateRange: {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(new Date().getFullYear(), 11, 31),
    },
    category: "all" as string,
    type: "all" as "all" | "receita" | "despesa",
  });

  useEffect(() => {
    // Função para buscar categorias distintas
    const fetchCategories = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers) return;
        const response = await axios.get('/api/transactions/categories', { headers });
        setAvailableCategories(response.data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    
    fetchCategories();
  }, [getAuthHeaders]);

  // Adicionando a função ao escopo do componente para ser acessível pelo botão
  const fetchReportData = async () => {
    if (!filters.dateRange.from || !filters.dateRange.to) return;
      
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado");

      const params = new URLSearchParams({
        startDate: filters.dateRange.from.toISOString(),
        endDate: filters.dateRange.to.toISOString(),
        limit: "2000",
      });

      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }

      const response = await axios.get(`/api/transactions?${params.toString()}`, { headers });
      const transactions: Transaction[] = response.data.transactions;
      
      console.log("DEBUG: Transações recebidas da API:", transactions);
      processData(transactions);

    } catch (error) {
      console.error("Erro ao buscar dados para o relatório:", error);
      setReportData(null);
      setError("Erro ao buscar dados para o relatório. Por favor, tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [filters, getAuthHeaders]);

  const processData = (transactions: Transaction[]) => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyData = months.map(month => ({
      month: new Date(new Date().getFullYear(), month - 1).toLocaleString('pt-BR', { month: 'short' }),
      Receitas: 0,
      Despesas: 0,
    }));

    transactions.forEach(t => {
      const monthIndex = new Date(t.date).getMonth();
      if (t.type === 'receita') {
        monthlyData[monthIndex].Receitas += t.amount;
      } else {
        monthlyData[monthIndex].Despesas += t.amount;
      }
    });

    const totalIncome = monthlyData.reduce((acc, data) => acc + data.Receitas, 0);
    const totalExpenses = monthlyData.reduce((acc, data) => acc + data.Despesas, 0);

    const expensesByCategory = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        const category = acc.find(c => c.name === t.category);
        if (category) {
          category.value += t.amount;
        } else {
          acc.push({ name: t.category, value: t.amount });
        }
        return acc;
      }, [] as { name: string; value: number }[]);

    const finalReportData = {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      expensesByCategory,
      incomeVsExpenses: monthlyData,
    };

    console.log("DEBUG: Dados processados para os gráficos:", finalReportData);
    setReportData(finalReportData);
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let from = new Date();
    let to = new Date();

    switch (period) {
      case "this-month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "this-year":
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
      // Adicionar outros casos como "last-month"
    }
    
    setFilters(prev => ({ ...prev, period, dateRange: { from, to } }));
  };

  if (loading) {
    return <RelatoriosSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg max-w-md">
          <h3 className="text-xl font-semibold text-destructive">Erro ao Carregar Relatórios</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={fetchReportData} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="p-6 bg-muted/50 border rounded-lg max-w-md">
          <h3 className="text-xl font-semibold">Nenhum dado encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Não há dados de transação para o período selecionado.
          </p>
        </div>
      </div>
    );
  }

  const categoryChartData = reportData.expensesByCategory.map(item => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Analise seus dados financeiros e tome decisões informadas
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
              <SelectItem value="semestre">Último Semestre</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full md:w-auto" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" /> Exportar Dados
          </Button>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg w-full md:w-fit">
          <button
            onClick={() => setActiveTab('tendencias')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tendencias' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tendências Anuais
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'categorias' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Despesas por Categoria
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Visão Geral</CardTitle>
              <CardDescription>Resumo das suas finanças no período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    {formatCurrency(reportData?.totalIncome || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-xl md:text-2xl font-bold text-red-600">
                    {formatCurrency(reportData?.totalExpenses || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="text-xl md:text-2xl font-bold">
                    {formatCurrency(reportData?.balance || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Economia</p>
                  <p className="text-xl md:text-2xl font-bold">
                    {reportData?.totalIncome > 0 
                      ? `${Math.round((reportData.balance / reportData.totalIncome) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeTab === 'tendencias' ? (
            <>
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                  <CardDescription>Evolução de receitas e despesas</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.incomeVsExpenses || []}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição</CardTitle>
                  <CardDescription>Proporção entre receitas e despesas</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={reportData?.expensesByCategory || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                        {reportData.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>Distribuição dos seus gastos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.expensesByCategory || []}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categorias</CardTitle>
                  <CardDescription>Maiores gastos por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.expensesByCategory.length > 0 ? (
                      reportData.expensesByCategory
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5) // Mostra apenas as 5 maiores
                        .map((categoria, index) => {
                          const totalExpenses = reportData.totalExpenses || 1; // Garante que não é zero
                          const percentage = (categoria.value / totalExpenses) * 100;
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{categoria.name}</span>
                                <span>{formatCurrency(categoria.value)}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-muted-foreground text-right">
                                {Math.round(percentage)}% do total
                              </p>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma despesa registrada no período.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 