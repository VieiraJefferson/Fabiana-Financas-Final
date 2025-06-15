"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DialogFooter,
  DialogHeader as DialogHeaderComponent,
} from "@/components/ui/dialog";
import {
  Pencil,
  Target,
  Trash,
  MoreHorizontal,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Meta {
  _id: string;
  title: string;
  description: string;
  type: 'economia' | 'investimento' | 'divida' | 'compra' | 'aposentadoria';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'ativa' | 'concluida' | 'pausada';
  createdAt: string;
  priority: 'baixa' | 'media' | 'alta';
}

interface NovaMetaForm {
  title: string;
  description: string;
  type: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  priority: string;
}

export default function MetasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

  // Estados para filtros e ordenação
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas');
  const [ordenacao, setOrdenacao] = useState<string>('prazo');

  const [novaMetaForm, setNovaMetaForm] = useState<NovaMetaForm>({
    title: '',
    description: '',
    type: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    priority: 'media'
  });

  useEffect(() => {
    const fetchMetas = async () => {
      if (!session) return;
      
      setIsLoading(true);
      setError("");
      
      try {
        const headers = getAuthHeaders();
        if (!headers) throw new Error("Usuário não autenticado.");
        
        const { data } = await axios.get('/api/goals', { headers });
        setMetas(data);
      } catch (err: any) {
        console.error("Erro ao buscar metas:", err);
        setError("Não foi possível carregar suas metas financeiras.");
        toast.error("Erro ao carregar metas financeiras.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetas();
  }, [session, getAuthHeaders]);

  const tiposMeta = [
    { value: 'economia', label: 'Economia/Poupança', icon: '💰' },
    { value: 'investimento', label: 'Investimento', icon: '📈' },
    { value: 'divida', label: 'Quitação de Dívida', icon: '💳' },
    { value: 'compra', label: 'Compra/Objetivo', icon: '🛍️' },
    { value: 'aposentadoria', label: 'Aposentadoria', icon: '🏖️' }
  ];

  const prioridades = [
    { value: 'baixa', label: 'Baixa', color: 'text-gray-600' },
    { value: 'media', label: 'Média', color: 'text-yellow-600' },
    { value: 'alta', label: 'Alta', color: 'text-red-600' }
  ];

  const getMetaIcon = (type: string) => {
    const icons = {
      economia: '💰',
      investimento: '📈',
      divida: '💳',
      compra: '🛍️',
      aposentadoria: '🏖️'
    };
    return icons[type as keyof typeof icons] || '🎯';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativa: 'text-success bg-success/10',
              concluida: 'text-primary bg-primary/10',
        pausada: 'text-muted-foreground bg-muted'
    };
          return colors[status as keyof typeof colors] || 'text-muted-foreground bg-muted';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: 'text-muted-foreground',
      media: 'text-warning',
      alta: 'text-danger'
    };
          return colors[priority as keyof typeof colors] || 'text-muted-foreground';
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log('=== DEBUG META SUBMIT ===');
    console.log('Form data:', novaMetaForm);
    console.log('Editing meta:', editingMeta ? editingMeta._id : 'Nova meta');

    try {
      const headers = getAuthHeaders();
      console.log('Auth headers:', headers ? 'Presentes' : 'Ausentes');
      if (!headers) throw new Error("Usuário não autenticado.");

      const metaData = {
        title: novaMetaForm.title,
        description: novaMetaForm.description,
        type: novaMetaForm.type,
        targetAmount: parseFloat(novaMetaForm.targetAmount),
        currentAmount: parseFloat(novaMetaForm.currentAmount || '0'),
        deadline: novaMetaForm.deadline,
        priority: novaMetaForm.priority
      };
      console.log('Meta data para enviar:', metaData);

      if (editingMeta) {
        // Atualizar meta existente
        console.log(`Atualizando meta ${editingMeta._id}...`);
        const { data } = await axios.put(`/api/goals/${editingMeta._id}`, metaData, { headers });
        console.log('Resposta da API (update):', data);
        setMetas(prev => prev.map(meta => meta._id === editingMeta._id ? data : meta));
        toast.success("Meta atualizada com sucesso!");
      } else {
        // Criar nova meta
        console.log('Criando nova meta...');
        console.log('URL da requisição:', '/api/goals');
        try {
          const response = await axios.post('/api/goals', metaData, { headers });
          console.log('Resposta da API (create):', response.data);
          console.log('Status da resposta:', response.status);
          setMetas(prev => [...prev, response.data]);
          toast.success("Meta criada com sucesso!");
        } catch (axiosError: any) {
          console.error('Erro detalhado do Axios:', {
            message: axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            config: {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              headers: axiosError.config?.headers
            }
          });
          throw axiosError;
        }
      }

      // Reset form
      setNovaMetaForm({
        title: '',
        description: '',
        type: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        priority: 'media'
      });
      setEditingMeta(null);
      setShowNewGoalDialog(false);

    } catch (err: any) {
      console.error("Erro ao salvar meta:", err);
      console.error("Detalhes do erro:", err.response?.data);
      setError(err.response?.data?.message || "Erro ao salvar meta. Tente novamente.");
      toast.error("Erro ao salvar meta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta);
    setNovaMetaForm({
      title: meta.title,
      description: meta.description || '',
      type: meta.type,
      targetAmount: meta.targetAmount.toString(),
      currentAmount: meta.currentAmount.toString(),
      deadline: meta.deadline.split('T')[0], // Formatar a data para YYYY-MM-DD
      priority: meta.priority
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (metaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");
      
      await axios.delete(`/api/goals/${metaId}`, { headers });
      setMetas(prev => prev.filter(meta => meta._id !== metaId));
      toast.success("Meta excluída com sucesso!");
    } catch (err: any) {
      console.error("Erro ao excluir meta:", err);
      toast.error("Erro ao excluir meta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (metaId: string, newAmount: number) => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");
      
      const { data } = await axios.patch(`/api/goals/${metaId}/progress`, { 
        currentAmount: newAmount 
      }, { headers });
      
      setMetas(prev => prev.map(meta => meta._id === metaId ? data : meta));
      toast.success("Progresso atualizado com sucesso!");
      
      // Verificar se a meta foi concluída
      if (data.status === 'concluida') {
        toast.success("🎉 Parabéns! Você atingiu sua meta!");
      }
    } catch (err: any) {
      console.error("Erro ao atualizar progresso:", err);
      toast.error("Erro ao atualizar progresso.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dados calculados
  const metasAtivas = metas.filter(meta => meta.status === 'ativa');
  const metasConcluidas = metas.filter(meta => meta.status === 'concluida');
  const totalEconomizado = metas.reduce((total, meta) => total + meta.currentAmount, 0);
  const totalObjetivos = metas.reduce((total, meta) => total + meta.targetAmount, 0);

  // Filtragem de metas
  const metasFiltradas = metas.filter(meta => {
    if (filtroStatus !== 'todas' && meta.status !== filtroStatus) return false;
    if (filtroPrioridade !== 'todas' && meta.priority !== filtroPrioridade) return false;
    return true;
  }).sort((a, b) => {
    switch (ordenacao) {
      case 'prazo':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'progresso':
        const progressoA = (a.currentAmount / a.targetAmount) * 100;
        const progressoB = (b.currentAmount / b.targetAmount) * 100;
        return progressoB - progressoA;
      case 'valor':
        return b.targetAmount - a.targetAmount;
      default:
        return 0;
    }
  });

  // Adicionar um botão de teste para verificar a API
  const testGoalsAPI = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");
      
      console.log("Testando API de metas - GET");
      const response = await fetch('/api/goals', {
        method: 'GET',
        headers: headers,
      });
      
      const data = await response.json();
      console.log("Resposta da API:", data);
      console.log("Status:", response.status);
      
      toast.success("Teste da API concluído. Verifique o console.");
    } catch (error) {
      console.error("Erro ao testar API:", error);
      toast.error("Erro ao testar API. Verifique o console.");
    }
  };

  const testCreateGoal = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");
      
      console.log("Testando API de metas - POST");
      const testData = {
        title: "Meta de Teste via Botão",
        description: "Esta é uma meta de teste criada via botão de teste",
        type: "economia",
        targetAmount: 1000,
        currentAmount: 0,
        deadline: new Date().toISOString().split('T')[0],
        priority: "media",
      };
      
      console.log("Dados de teste:", testData);
      
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testData),
      });
      
      const data = await response.json();
      console.log("Resposta da API:", data);
      console.log("Status:", response.status);
      
      if (response.ok) {
        setMetas(prev => [...prev, data]);
        toast.success("Meta de teste criada com sucesso!");
      } else {
        toast.error("Erro ao criar meta de teste.");
      }
    } catch (error) {
      console.error("Erro ao criar meta de teste:", error);
      toast.error("Erro ao criar meta de teste. Verifique o console.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Minhas Metas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Acompanhe e gerencie seus objetivos financeiros
          </p>
        </div>
        <Button onClick={() => setShowNewGoalDialog(true)} className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Meta
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-1 md:pb-2 px-3 md:px-6 py-2 md:py-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total de Metas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 py-2 md:py-4">
            <div className="text-xl md:text-2xl font-bold">{metas.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {metasAtivas.length} ativas, {metasConcluidas.length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 px-3 md:px-6 py-2 md:py-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Economizado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 py-2 md:py-4">
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(totalEconomizado)}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Valor atual acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 px-3 md:px-6 py-2 md:py-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total de Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 py-2 md:py-4">
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(totalObjetivos)}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Soma de todas as metas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 px-3 md:px-6 py-2 md:py-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 py-2 md:py-4">
            <div className="text-xl md:text-2xl font-bold">
              {totalObjetivos > 0 ? Math.round((totalEconomizado / totalObjetivos) * 100) : 0}%
            </div>
            <Progress 
              value={totalObjetivos > 0 ? (totalEconomizado / totalObjetivos) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base md:text-lg font-semibold">Suas Metas</h2>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="concluida">Concluídas</SelectItem>
                <SelectItem value="pausada">Pausadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="alta">Alta Prioridade</SelectItem>
                <SelectItem value="media">Média Prioridade</SelectItem>
                <SelectItem value="baixa">Baixa Prioridade</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prazo">Data Limite</SelectItem>
                <SelectItem value="progresso">Progresso</SelectItem>
                <SelectItem value="valor">Valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metasFiltradas.map((meta) => (
            <Card key={meta._id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <span>{getMetaIcon(meta.type)}</span>
                      <span className="line-clamp-1">{meta.title}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{meta.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(meta)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateProgress(meta._id, meta.currentAmount)}>
                        <Target className="mr-2 h-4 w-4" />
                        <span>Atualizar Progresso</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(meta._id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">
                        {formatCurrency(meta.currentAmount)} / {formatCurrency(meta.targetAmount)}
                      </span>
                    </div>
                    <Progress value={calculateProgress(meta.currentAmount, meta.targetAmount)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(meta.status)}`}>
                        {meta.status.charAt(0).toUpperCase() + meta.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prioridade</p>
                      <p className={`font-medium ${getPriorityColor(meta.priority)}`}>
                        {meta.priority.charAt(0).toUpperCase() + meta.priority.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data Limite</p>
                      <p className="font-medium">{formatDate(meta.deadline)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dias Restantes</p>
                      <p className="font-medium">{getDaysRemaining(meta.deadline)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
            <DialogDescription>
              Defina uma nova meta financeira. Preencha todos os campos necessários.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Comprar um carro"
                  value={novaMetaForm.title}
                  onChange={(e) => setNovaMetaForm(prev => ({...prev, title: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva sua meta..."
                  value={novaMetaForm.description}
                  onChange={(e) => setNovaMetaForm(prev => ({...prev, description: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={novaMetaForm.type} onValueChange={(value) => setNovaMetaForm(prev => ({...prev, type: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMeta.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="valorObjetivo">Valor Objetivo</Label>
                <Input
                  id="valorObjetivo"
                  type="number"
                  placeholder="0,00"
                  value={novaMetaForm.targetAmount}
                  onChange={(e) => setNovaMetaForm(prev => ({...prev, targetAmount: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="valorInicial">Valor Inicial</Label>
                <Input
                  id="valorInicial"
                  type="number"
                  placeholder="0,00"
                  value={novaMetaForm.currentAmount}
                  onChange={(e) => setNovaMetaForm(prev => ({...prev, currentAmount: e.target.value}))}
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="prazo">Data Limite</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={novaMetaForm.deadline}
                  onChange={(e) => setNovaMetaForm(prev => ({...prev, deadline: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={novaMetaForm.priority} onValueChange={(value) => setNovaMetaForm(prev => ({...prev, priority: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((prioridade) => (
                      <SelectItem
                        key={prioridade.value}
                        value={prioridade.value}
                        className={prioridade.color}
                      >
                        {prioridade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Meta
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Atualize as informações da sua meta.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Comprar um carro"
                  value={editingMeta?.title || ''}
                  onChange={(e) => setEditingMeta(prev => ({...prev, title: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva sua meta..."
                  value={editingMeta?.description || ''}
                  onChange={(e) => setEditingMeta(prev => ({...prev, description: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={editingMeta?.type || ''} onValueChange={(value) => setEditingMeta(prev => ({...prev, type: value as 'economia' | 'investimento' | 'divida' | 'compra' | 'aposentadoria'}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMeta.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="valorObjetivo">Valor Objetivo</Label>
                <Input
                  id="valorObjetivo"
                  type="number"
                  placeholder="0,00"
                  value={editingMeta?.targetAmount.toString() || ''}
                  onChange={(e) => setEditingMeta(prev => ({...prev, targetAmount: parseFloat(e.target.value)}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="valorInicial">Valor Inicial</Label>
                <Input
                  id="valorInicial"
                  type="number"
                  placeholder="0,00"
                  value={editingMeta?.currentAmount.toString() || ''}
                  onChange={(e) => setEditingMeta(prev => ({...prev, currentAmount: parseFloat(e.target.value)}))}
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="prazo">Data Limite</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={editingMeta?.deadline.split('T')[0] || ''}
                  onChange={(e) => setEditingMeta(prev => ({...prev, deadline: e.target.value}))}
                  required
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={editingMeta?.priority || ''} onValueChange={(value) => setEditingMeta(prev => ({...prev, priority: value as 'baixa' | 'media' | 'alta'}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((prioridade) => (
                      <SelectItem
                        key={prioridade.value}
                        value={prioridade.value}
                        className={prioridade.color}
                      >
                        {prioridade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Atualizar Meta
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Atualização de Progresso */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        {/* ... conteúdo do dialog de atualização de progresso ... */}
      </Dialog>
    </div>
  );
} 