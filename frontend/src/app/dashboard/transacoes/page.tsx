"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, ArrowLeftRight, ArrowUpCircle, ArrowDownCircle, Calendar, ArrowLeft } from "lucide-react";
import { columns, Transaction } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiCache, CACHE_KEYS } from "@/lib/cache";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

interface TransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  total: number;
}

interface TransactionsSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  countReceitas: number;
  countDespesas: number;
}

async function getData(getAuthHeaders: () => Record<string, string> | null): Promise<Transaction[]> {
    try {
        const headers = getAuthHeaders();
        if (!headers) {
            console.error("Usuário não autenticado.");
            return [];
        }
        
        const response = await axios.get('/api/transactions', { headers });
        return response.data.transactions;

    } catch (error) {
        console.error("Erro ao buscar dados das transações:", error);
        return [];
    }
}

export default function TransacoesPage() {
  const { getAuthHeaders } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TransactionsSummary>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    countReceitas: 0,
    countDespesas: 0
  });
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        if (!headers) throw new Error("Usuário não autenticado");

        // Check cache first
        const cachedTransactions = apiCache.get(CACHE_KEYS.TRANSACTIONS);
        const cachedSummary = apiCache.get(`${CACHE_KEYS.TRANSACTIONS}_summary`);

        if (cachedTransactions && cachedSummary) {
          setData(cachedTransactions);
          setSummary(cachedSummary);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const [transactionsData, summaryData] = await Promise.all([
          getData(getAuthHeaders),
          axios.get('/api/transactions/summary', { headers })
        ]);

        // Cache the results
        apiCache.set(CACHE_KEYS.TRANSACTIONS, transactionsData, 2); // Cache for 2 minutes
        apiCache.set(`${CACHE_KEYS.TRANSACTIONS}_summary`, summaryData.data, 2);

        setData(transactionsData);
        setSummary(summaryData.data);
      } catch (err: any) {
        console.error("Erro ao buscar transações:", err);
        setError("Não foi possível carregar as transações.");
        toast.error("Erro ao carregar as transações.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="p-3 sm:p-4 space-y-4 max-w-full overflow-x-hidden">
          {/* Mobile Header Skeleton */}
          <div className="md:hidden bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          
          {/* Desktop Header Skeleton */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-primary-foreground hover:bg-white/10 p-1 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              <h1 className="text-lg font-bold">Transações</h1>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Gerencie suas movimentações financeiras
          </p>
          <Button 
            onClick={() => router.push("/dashboard/nova-transacao")}
            size="sm"
            className="w-full bg-white text-primary hover:bg-white/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ArrowLeftRight className="h-6 w-6" />
                Transações
              </h1>
              <p className="text-muted-foreground">
                Gerencie todas as suas movimentações financeiras.
              </p>
            </div>
            <Button 
              onClick={() => router.push("/dashboard/nova-transacao")}
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-4 max-w-full overflow-x-hidden pb-4">
          {/* Cards de Resumo - Mobile optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Receitas</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                  {formatCurrency(summary.totalReceitas)}
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {summary.countReceitas} transações
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Despesas</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 truncate">
                  {formatCurrency(summary.totalDespesas)}
                </div>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {summary.countDespesas} transações
                </p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Saldo Total</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-xl sm:text-2xl font-bold truncate ${
                  summary.saldo >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(summary.saldo)}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Total de {summary.countReceitas + summary.countDespesas} transações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-md text-red-600 dark:text-red-400">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Tabela de Dados - Mobile optimized */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListFilter className="h-5 w-5" />
                Lista de Transações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <DataTable columns={columns} data={data} />
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {data.length === 0 && !loading && (
            <div className="text-center py-12">
              <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando sua primeira transação
              </p>
              <Button onClick={() => router.push("/dashboard/nova-transacao")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Transação
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 