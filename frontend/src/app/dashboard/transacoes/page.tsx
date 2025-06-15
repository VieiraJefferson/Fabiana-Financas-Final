"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, ArrowLeftRight, ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react";
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

        const [transactionsData, summaryData] = await Promise.all([
          getData(getAuthHeaders),
          axios.get('/api/transactions/summary', { headers })
        ]);

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
  }, [getAuthHeaders, toast]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="h-5 md:h-6 w-5 md:w-6" />
            Transações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas movimentações financeiras.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/nova-transacao")}
          size="sm"
          className="w-full sm:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceitas)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.countReceitas} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDespesas)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.countDespesas} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.saldo)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de {summary.countReceitas + summary.countDespesas} transações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados */}
      <div className="rounded-lg border bg-card">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
} 