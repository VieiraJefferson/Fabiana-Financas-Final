'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Video, 
  CreditCard, 
  BarChart3, 
  Settings,
  UserPlus,
  PlayCircle,
  TrendingUp,
  ShieldCheck 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalVideos: number;
  publishedVideos: number;
  usersByPlan: Array<{ _id: string; count: number }>;
  newUsers: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Verificar se é admin (compatibilidade com ambos os sistemas)
    const isAdmin = session.user?.role === 'admin' || 
                    session.user?.role === 'super_admin' || 
                    session.user?.isAdmin;

    if (!isAdmin) {
      toast.error('Acesso negado. Você não tem permissões de administrador.');
      router.push('/dashboard');
      return;
    }

    fetchAdminStats();
  }, [session, status, router]);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPlanDisplayName = (plan: string) => {
    const names = {
      free: 'Gratuito',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };
    return names[plan as keyof typeof names] || plan;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Painel de Administração</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie usuários, conteúdo e configurações do Fabi Finanças
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsers} nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Premium</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% conversão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vídeos</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedVideos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalVideos} total ({stats.totalVideos - stats.publishedVideos} não publicados)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição por Planos */}
      {stats && stats.usersByPlan.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição por Planos</CardTitle>
            <CardDescription>
              Quantidade de usuários em cada plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.usersByPlan.map((plan) => (
                <Badge key={plan._id} variant="outline" className="px-3 py-1">
                  {getPlanDisplayName(plan._id)}: {plan.count} usuários
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestão de Usuários
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/admin/users')}
                  className="w-full"
                >
                  Gerenciar Usuários
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Gestão de Conteúdo
                </CardTitle>
                <CardDescription>
                  Upload e gerenciamento de vídeos de mentoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/admin/videos')}
                  className="w-full"
                >
                  Gerenciar Vídeos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuração de Planos
                </CardTitle>
                <CardDescription>
                  Configure preços e recursos dos planos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/admin/plans')}
                  className="w-full"
                >
                  Configurar Planos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Relatórios Avançados
                </CardTitle>
                <CardDescription>
                  Análises detalhadas e métricas de negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/admin/reports')}
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>
                Esta seção será expandida em uma página dedicada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/admin/users')}>
                Ir para Gestão de Usuários
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Vídeos</CardTitle>
              <CardDescription>
                Esta seção será expandida em uma página dedicada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/admin/videos')}>
                Ir para Gestão de Vídeos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Planos</CardTitle>
              <CardDescription>
                Esta seção será expandida em uma página dedicada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/admin/plans')}>
                Ir para Configuração de Planos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configurações gerais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidades de configuração serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 