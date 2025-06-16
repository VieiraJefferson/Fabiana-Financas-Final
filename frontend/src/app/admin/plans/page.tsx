'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Save,
  Star,
  Users,
  Check,
  CreditCard,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Plan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: {
    maxTransactions: number;
    maxCategories: number;
    maxGoals: number;
    hasAdvancedReports: boolean;
    hasVideoAccess: boolean;
    hasExport: boolean;
    hasPrioritySupport: boolean;
    hasMultipleAccounts: boolean;
  };
  highlights: string[];
  isActive: boolean;
  order: number;
  isPopular: boolean;
}

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const isAdmin = session.user?.role === 'admin' || 
                    session.user?.role === 'super_admin' || 
                    session.user?.isAdmin;

    if (!isAdmin) {
      toast.error('Acesso negado. Você não tem permissões de administrador.');
      router.push('/dashboard');
      return;
    }

    fetchPlans();
  }, [session, status, router]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/admin/plans', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (plan: Plan) => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/plans/${plan._id}`, plan, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Plano atualizado com sucesso!');
      setEditingPlan(null);
      fetchPlans();
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };

  const updateEditingPlan = (field: string, value: any) => {
    if (!editingPlan) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditingPlan({
        ...editingPlan,
        [parent]: {
          ...editingPlan[parent as keyof Plan],
          [child]: value
        }
      });
    } else {
      setEditingPlan({
        ...editingPlan,
        [field]: value
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Planos</h1>
        </div>
        <p className="text-muted-foreground">
          Configure preços, recursos e características dos planos de assinatura
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan._id} className={`relative ${plan.isPopular ? 'ring-2 ring-primary' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                  <CardDescription className="mt-1">
                    {plan.description}
                  </CardDescription>
                </div>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="pt-4">
                <div className="text-3xl font-bold">
                  R$ {plan.price.monthly.toFixed(2)}
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ou R$ {plan.price.yearly.toFixed(2)}/ano
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Transações</span>
                  <span className="font-medium">
                    {plan.features.maxTransactions === -1 ? 'Ilimitadas' : plan.features.maxTransactions}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Categorias</span>
                  <span className="font-medium">
                    {plan.features.maxCategories === -1 ? 'Ilimitadas' : plan.features.maxCategories}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Metas</span>
                  <span className="font-medium">
                    {plan.features.maxGoals === -1 ? 'Ilimitadas' : plan.features.maxGoals}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Feature Badges */}
              <div className="space-y-2">
                {plan.features.hasAdvancedReports && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Relatórios Avançados
                  </div>
                )}
                {plan.features.hasVideoAccess && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Acesso aos Vídeos
                  </div>
                )}
                {plan.features.hasExport && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Export de Dados
                  </div>
                )}
                {plan.features.hasPrioritySupport && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Suporte Prioritário
                  </div>
                )}
                {plan.features.hasMultipleAccounts && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Múltiplas Contas
                  </div>
                )}
              </div>

              <Separator />

              <Button 
                onClick={() => setEditingPlan(plan)}
                className="w-full"
                variant="outline"
              >
                Editar Plano
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Editar Plano: {editingPlan.displayName}</CardTitle>
              <CardDescription>
                Modifique os preços e recursos do plano
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Preços */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly">Preço Mensal (R$)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    step="0.01"
                    value={editingPlan.price.monthly}
                    onChange={(e) => updateEditingPlan('price.monthly', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearly">Preço Anual (R$)</Label>
                  <Input
                    id="yearly"
                    type="number"
                    step="0.01"
                    value={editingPlan.price.yearly}
                    onChange={(e) => updateEditingPlan('price.yearly', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Recursos Numéricos */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTransactions">Max Transações</Label>
                  <Input
                    id="maxTransactions"
                    type="number"
                    value={editingPlan.features.maxTransactions}
                    onChange={(e) => updateEditingPlan('features.maxTransactions', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCategories">Max Categorias</Label>
                  <Input
                    id="maxCategories"
                    type="number"
                    value={editingPlan.features.maxCategories}
                    onChange={(e) => updateEditingPlan('features.maxCategories', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGoals">Max Metas</Label>
                  <Input
                    id="maxGoals"
                    type="number"
                    value={editingPlan.features.maxGoals}
                    onChange={(e) => updateEditingPlan('features.maxGoals', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Recursos Booleanos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasAdvancedReports">Relatórios Avançados</Label>
                  <Switch
                    id="hasAdvancedReports"
                    checked={editingPlan.features.hasAdvancedReports}
                    onCheckedChange={(checked) => updateEditingPlan('features.hasAdvancedReports', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasVideoAccess">Acesso aos Vídeos</Label>
                  <Switch
                    id="hasVideoAccess"
                    checked={editingPlan.features.hasVideoAccess}
                    onCheckedChange={(checked) => updateEditingPlan('features.hasVideoAccess', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasExport">Export de Dados</Label>
                  <Switch
                    id="hasExport"
                    checked={editingPlan.features.hasExport}
                    onCheckedChange={(checked) => updateEditingPlan('features.hasExport', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasPrioritySupport">Suporte Prioritário</Label>
                  <Switch
                    id="hasPrioritySupport"
                    checked={editingPlan.features.hasPrioritySupport}
                    onCheckedChange={(checked) => updateEditingPlan('features.hasPrioritySupport', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasMultipleAccounts">Múltiplas Contas</Label>
                  <Switch
                    id="hasMultipleAccounts"
                    checked={editingPlan.features.hasMultipleAccounts}
                    onCheckedChange={(checked) => updateEditingPlan('features.hasMultipleAccounts', checked)}
                  />
                </div>
              </div>

              {/* Configurações do Plano */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Plano Ativo</Label>
                  <Switch
                    id="isActive"
                    checked={editingPlan.isActive}
                    onCheckedChange={(checked) => updateEditingPlan('isActive', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPopular">Plano Popular</Label>
                  <Switch
                    id="isPopular"
                    checked={editingPlan.isPopular}
                    onCheckedChange={(checked) => updateEditingPlan('isPopular', checked)}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setEditingPlan(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleSavePlan(editingPlan)}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 