import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';

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

interface DateRange {
  from: Date;
  to: Date;
}

// Cache global para dados financeiros
const dataCache = new Map<string, { data: FinancialData; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export function useFinancialData(dateRange: DateRange) {
  const { data: session } = useSession();
  const { getAuthHeaders } = useAuth();
  
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getCacheKey = useCallback((range: DateRange) => {
    return `${range.from.toISOString()}-${range.to.toISOString()}`;
  }, []);

  const fetchData = useCallback(async (range: DateRange, forceRefresh = false) => {
    if (!session) return;

    const cacheKey = getCacheKey(range);
    const cached = dataCache.get(cacheKey);

    // Verificar cache se não for refresh forçado
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Se já temos dados, apenas mostrar que está atualizando
    if (data && !forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");

      const params = new URLSearchParams({
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString(),
      });

      const [summaryResponse, transactionsResponse] = await Promise.all([
        axios.get(`/api/transactions/summary?${params.toString()}`, { headers }),
        axios.get('/api/transactions?limit=5&page=1', { headers })
      ]);
      
      const summary = summaryResponse.data;
      const transactions = transactionsResponse.data.transactions || [];

      const newData: FinancialData = {
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
      };

      setData(newData);
      
      // Salvar no cache
      dataCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now()
      });

    } catch (err: any) {
      console.error("Erro ao buscar dados financeiros:", err);
      
      // Se não temos dados e deu erro, usar dados padrão
      if (!data) {
        const defaultData: FinancialData = {
          saldo: 0,
          receitas: 0,
          despesas: 0,
          transacoes: []
        };
        setData(defaultData);
      }
      
      setError("Erro ao carregar dados financeiros.");
      if (forceRefresh) {
        toast.error("Erro ao atualizar dados financeiros.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [session, getAuthHeaders, data, getCacheKey]);

  useEffect(() => {
    fetchData(dateRange);
  }, [fetchData, dateRange]);

  const refresh = useCallback(() => {
    fetchData(dateRange, true);
  }, [fetchData, dateRange]);

  return {
    data: data || { saldo: 0, receitas: 0, despesas: 0, transacoes: [] },
    loading,
    error,
    isRefreshing,
    refresh
  };
} 