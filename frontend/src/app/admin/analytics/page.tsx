"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: Array<{ month: string; value: number }>;
    byPlan: Array<{ plan: string; value: number; percentage: number }>;
  };
  users: {
    total: number;
    active: number;
    new: number;
    growth: Array<{ month: string; value: number }>;
    retention: number;
  };
  content: {
    totalVideos: number;
    totalViews: number;
    avgWatchTime: number;
    topVideos: Array<{ title: string; views: number; rating: number }>;
    viewsByCategory: Array<{ category: string; views: number }>;
  };
  engagement: {
    dailyActiveUsers: number;
    avgSessionTime: number;
    completionRate: number;
    feedbackScore: number;
  };
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  // Dados mockados - substituir por dados reais da API
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Simular carregamento de dados
        await new Promise(resolve => setTimeout(resolve, 1000));

        setAnalytics({
          revenue: {
            total: 89750.50,
            monthly: [
              { month: "Jan", value: 15420 },
              { month: "Fev", value: 18650 },
              { month: "Mar", value: 22340 },
              { month: "Abr", value: 19870 },
              { month: "Mai", value: 25680 },
              { month: "Jun", value: 28450 }
            ],
            byPlan: [
              { plan: "Basic", value: 26925, percentage: 30 },
              { plan: "Advanced", value: 35900, percentage: 40 },
              { plan: "Premium", value: 26925, percentage: 30 }
            ]
          },
          users: {
            total: 1247,
            active: 892,
            new: 156,
            growth: [
              { month: "Jan", value: 850 },
              { month: "Fev", value: 920 },
              { month: "Mar", value: 1050 },
              { month: "Abr", value: 1120 },
              { month: "Mai", value: 1200 },
              { month: "Jun", value: 1247 }
            ],
            retention: 78.5
          },
          content: {
            totalVideos: 45,
            totalViews: 12450,
            avgWatchTime: 18.5,
            topVideos: [
              { title: "Fundamentos do Orçamento Pessoal", views: 1250, rating: 4.8 },
              { title: "Estratégias de Investimento", views: 890, rating: 4.6 },
              { title: "Planejamento de Aposentadoria", views: 756, rating: 4.7 },
              { title: "Como Quitar Dívidas", views: 645, rating: 4.5 },
              { title: "Reserva de Emergência", views: 534, rating: 4.9 }
            ],
            viewsByCategory: [
              { category: "Orçamento", views: 3450 },
              { category: "Investimentos", views: 2890 },
              { category: "Aposentadoria", views: 2156 },
              { category: "Dívidas", views: 1890 },
              { category: "Economia", views: 1564 },
              { category: "Empreendedorismo", views: 500 }
            ]
          },
          engagement: {
            dailyActiveUsers: 234,
            avgSessionTime: 24.5,
            completionRate: 67.8,
            feedbackScore: 4.6
          }
        });

      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar dados de analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas detalhadas e insights da plataforma
          </p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>💰</span>
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.total)}</div>
            <p className="text-xs text-success">+12.5% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>👥</span>
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.users.active)}</div>
            <p className="text-xs text-muted-foreground">
              de {formatNumber(analytics.users.total)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>🎥</span>
              Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.content.totalViews)}</div>
            <p className="text-xs text-success">+8.3% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>⭐</span>
              Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagement.feedbackScore}/5.0</div>
            <p className="text-xs text-success">+0.2 vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Receita e Crescimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📈</span>
              Receita Mensal
            </CardTitle>
            <CardDescription>
              Evolução da receita nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.revenue.monthly.map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(item.value / Math.max(...analytics.revenue.monthly.map(m => m.value))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>👤</span>
              Crescimento de Usuários
            </CardTitle>
            <CardDescription>
              Evolução da base de usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.users.growth.map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(item.value / Math.max(...analytics.users.growth.map(u => u.value))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Receita por Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💎</span>
            Receita por Plano
          </CardTitle>
          <CardDescription>
            Distribuição da receita entre os diferentes planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.revenue.byPlan.map((plan) => (
              <div key={plan.plan} className="text-center space-y-2">
                <div className="text-2xl font-bold">{formatCurrency(plan.value)}</div>
                <div className="text-sm text-muted-foreground">{plan.plan}</div>
                <div className="text-lg font-semibold text-primary">
                  {formatPercentage(plan.percentage)}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${plan.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo e Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🏆</span>
              Vídeos Mais Assistidos
            </CardTitle>
            <CardDescription>
              Top 5 vídeos por visualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.content.topVideos.map((video, index) => (
                <div key={video.title} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>👁️ {formatNumber(video.views)} views</span>
                      <span>⭐ {video.rating}/5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              Métricas de Engagement
            </CardTitle>
            <CardDescription>
              Indicadores de engajamento dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Usuários Ativos Diários</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.engagement.dailyActiveUsers)}</p>
                </div>
                <span className="text-2xl">📱</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tempo Médio de Sessão</p>
                  <p className="text-2xl font-bold">{analytics.engagement.avgSessionTime}min</p>
                </div>
                <span className="text-2xl">⏱️</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold">{formatPercentage(analytics.engagement.completionRate)}</p>
                </div>
                <span className="text-2xl">✅</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Retenção de Usuários</p>
                  <p className="text-2xl font-bold">{formatPercentage(analytics.users.retention)}</p>
                </div>
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizações por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📂</span>
            Visualizações por Categoria
          </CardTitle>
          <CardDescription>
            Distribuição de visualizações entre as categorias de conteúdo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.content.viewsByCategory.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-40 bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(category.views / Math.max(...analytics.content.viewsByCategory.map(c => c.views))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {formatNumber(category.views)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 