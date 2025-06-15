"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxVideos: number;
  supportLevel: 'email' | 'priority' | 'dedicated';
  createdAt: string;
  subscribers: number;
}

interface PlanForm {
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string;
  isActive: boolean;
  isPopular: boolean;
  maxVideos: number;
  supportLevel: string;
}

export default function AdminPlansPage() {
  const { data: session } = useSession();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [planForm, setPlanForm] = useState<PlanForm>({
    name: '',
    description: '',
    price: 0,
    billingPeriod: 'monthly',
    features: '',
    isActive: true,
    isPopular: false,
    maxVideos: 0,
    supportLevel: 'email'
  });

  // Dados mockados - substituir por dados reais da API
  useEffect(() => {
    setPlans([
      {
        id: '1',
        name: 'Basic',
        description: 'Plano básico para iniciantes em educação financeira',
        price: 29.99,
        billingPeriod: 'monthly',
        features: [
          'Acesso a vídeos básicos',
          'Suporte por email',
          'Comunidade exclusiva',
          'Planilhas básicas'
        ],
        isActive: true,
        isPopular: false,
        maxVideos: 20,
        supportLevel: 'email',
        createdAt: '2024-01-01',
        subscribers: 450
      },
      {
        id: '2',
        name: 'Advanced',
        description: 'Plano avançado com mentoria em grupo',
        price: 59.99,
        billingPeriod: 'monthly',
        features: [
          'Todos os recursos do Basic',
          'Vídeos avançados',
          'Mentoria em grupo mensal',
          'Planilhas avançadas',
          'Webinars exclusivos'
        ],
        isActive: true,
        isPopular: true,
        maxVideos: 50,
        supportLevel: 'priority',
        createdAt: '2024-01-01',
        subscribers: 320
      },
      {
        id: '3',
        name: 'Premium',
        description: 'Plano premium com mentoria individual',
        price: 99.99,
        billingPeriod: 'monthly',
        features: [
          'Todos os recursos do Advanced',
          'Mentoria individual mensal',
          'Acesso prioritário a novos conteúdos',
          'Consultoria financeira personalizada',
          'Suporte dedicado'
        ],
        isActive: true,
        isPopular: false,
        maxVideos: 100,
        supportLevel: 'dedicated',
        createdAt: '2024-01-01',
        subscribers: 122
      },
      {
        id: '4',
        name: 'Enterprise',
        description: 'Plano para empresas e equipes',
        price: 199.99,
        billingPeriod: 'monthly',
        features: [
          'Todos os recursos do Premium',
          'Acesso para até 10 usuários',
          'Treinamentos corporativos',
          'Dashboard de gestão',
          'Relatórios personalizados'
        ],
        isActive: false,
        isPopular: false,
        maxVideos: 200,
        supportLevel: 'dedicated',
        createdAt: '2024-01-01',
        subscribers: 15
      }
    ]);
  }, []);

  const supportLevels = [
    { value: 'email', label: 'Email' },
    { value: 'priority', label: 'Prioritário' },
    { value: 'dedicated', label: 'Dedicado' }
  ];

  const billingPeriods = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newPlan: Plan = {
        id: editingPlan?.id || Date.now().toString(),
        name: planForm.name,
        description: planForm.description,
        price: planForm.price,
        billingPeriod: planForm.billingPeriod as Plan['billingPeriod'],
        features: planForm.features.split('\n').filter(f => f.trim()),
        isActive: planForm.isActive,
        isPopular: planForm.isPopular,
        maxVideos: planForm.maxVideos,
        supportLevel: planForm.supportLevel as Plan['supportLevel'],
        createdAt: editingPlan?.createdAt || new Date().toISOString(),
        subscribers: editingPlan?.subscribers || 0
      };

      if (editingPlan) {
        setPlans(prev => prev.map(plan => plan.id === editingPlan.id ? newPlan : plan));
        setSuccess("Plano atualizado com sucesso!");
      } else {
        setPlans(prev => [...prev, newPlan]);
        setSuccess("Plano criado com sucesso!");
      }

      // Reset form
      setPlanForm({
        name: '',
        description: '',
        price: 0,
        billingPeriod: 'monthly',
        features: '',
        isActive: true,
        isPopular: false,
        maxVideos: 0,
        supportLevel: 'email'
      });
      setEditingPlan(null);
      setIsDialogOpen(false);

    } catch (err: any) {
      setError("Erro ao salvar plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingPeriod: plan.billingPeriod,
      features: plan.features.join('\n'),
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      maxVideos: plan.maxVideos,
      supportLevel: plan.supportLevel
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.subscribers > 0) {
      setError(`Não é possível excluir o plano "${plan.name}" pois há ${plan.subscribers} assinantes ativos.`);
      return;
    }

    if (confirm('Tem certeza que deseja excluir este plano?')) {
      setPlans(prev => prev.filter(plan => plan.id !== planId));
      setSuccess("Plano excluído com sucesso!");
    }
  };

  const handleToggleActive = (planId: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
    ));
    setSuccess("Status do plano atualizado!");
  };

  const handleTogglePopular = (planId: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, isPopular: !plan.isPopular } : plan
    ));
    setSuccess("Destaque do plano atualizado!");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSupportLevelLabel = (level: string) => {
    return supportLevels.find(s => s.value === level)?.label || level;
  };

  const getBillingPeriodLabel = (period: string) => {
    return billingPeriods.find(b => b.value === period)?.label || period;
  };

  // Estatísticas
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.isActive).length;
  const totalSubscribers = plans.reduce((acc, plan) => acc + plan.subscribers, 0);
  const totalRevenue = plans.reduce((acc, plan) => acc + (plan.price * plan.subscribers), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de assinatura da plataforma
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPlan(null);
              setPlanForm({
                name: '',
                description: '',
                price: 0,
                billingPeriod: 'monthly',
                features: '',
                isActive: true,
                isPopular: false,
                maxVideos: 0,
                supportLevel: 'email'
              });
            }}>
              💎 Criar Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Atualize as informações do plano' : 'Crie um novo plano de assinatura'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Nome do Plano *</Label>
                  <Input
                    placeholder="Ex: Premium"
                    value={planForm.name}
                    onChange={(e) => setPlanForm(prev => ({...prev, name: e.target.value}))}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva o plano..."
                    value={planForm.description}
                    onChange={(e) => setPlanForm(prev => ({...prev, description: e.target.value}))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.99"
                    value={planForm.price}
                    onChange={(e) => setPlanForm(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Período de Cobrança</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={planForm.billingPeriod}
                    onChange={(e) => setPlanForm(prev => ({...prev, billingPeriod: e.target.value}))}
                  >
                    {billingPeriods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Máximo de Vídeos</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={planForm.maxVideos}
                    onChange={(e) => setPlanForm(prev => ({...prev, maxVideos: parseInt(e.target.value) || 0}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nível de Suporte</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={planForm.supportLevel}
                    onChange={(e) => setPlanForm(prev => ({...prev, supportLevel: e.target.value}))}
                  >
                    {supportLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Recursos (um por linha)</Label>
                  <Textarea
                    placeholder="Acesso a vídeos básicos&#10;Suporte por email&#10;Comunidade exclusiva"
                    value={planForm.features}
                    onChange={(e) => setPlanForm(prev => ({...prev, features: e.target.value}))}
                    rows={5}
                  />
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Plano Ativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Plano disponível para assinatura
                      </p>
                    </div>
                    <Switch
                      checked={planForm.isActive}
                      onCheckedChange={(checked) => setPlanForm(prev => ({...prev, isActive: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Plano Popular</Label>
                      <p className="text-sm text-muted-foreground">
                        Destacar como plano recomendado
                      </p>
                    </div>
                    <Switch
                      checked={planForm.isPopular}
                      onCheckedChange={(checked) => setPlanForm(prev => ({...prev, isPopular: checked}))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : editingPlan ? "Atualizar" : "Criar Plano"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-md">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-md">
          <p className="text-success text-sm">{success}</p>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {activePlans} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Assinantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-success">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Planos ({plans.length})
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-primary' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {!plan.isActive && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          INATIVO
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {plan.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(plan.price)}</div>
                    <div className="text-xs text-muted-foreground">
                      /{getBillingPeriodLabel(plan.billingPeriod)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Recursos */}
                <div>
                  <h4 className="font-medium mb-2">Recursos:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="text-success">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Assinantes:</span>
                    <div className="font-medium">{plan.subscribers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Suporte:</span>
                    <div className="font-medium">{getSupportLevelLabel(plan.supportLevel)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max. Vídeos:</span>
                    <div className="font-medium">{plan.maxVideos}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Criado em:</span>
                    <div className="font-medium">{formatDate(plan.createdAt)}</div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                    ✏️ Editar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleActive(plan.id)}
                  >
                    {plan.isActive ? '⏸️ Desativar' : '▶️ Ativar'}
                  </Button>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTogglePopular(plan.id)}
                  >
                    {plan.isPopular ? '⭐ Remover Destaque' : '⭐ Destacar'}
                  </Button>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(plan.id)}
                    disabled={plan.subscribers > 0}
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 