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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  MoreHorizontal, 
  Copy,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BudgetSummary {
  _id: string;
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  notes?: string;
}

interface BudgetSummaryResponse {
  month: number;
  year: number;
  categories: BudgetSummary[];
  totals: {
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
  };
}

interface BudgetForm {
  category: string;
  amount: string;
  month: number;
  year: number;
  notes: string;
}

export default function OrcamentosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewBudgetDialog, setShowNewBudgetDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Estados para filtros
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [budgetForm, setBudgetForm] = useState<BudgetForm>({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: ''
  });

  // Categorias comuns para orçamento
  const commonCategories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Contas',
    'Investimentos',
    'Emergência',
    'Outros'
  ];

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2);

  useEffect(() => {
    if (session) {
      fetchBudgets();
      fetchBudgetSummary();
    }
  }, [session, selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");

      const { data } = await axios.get(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`, { headers });
      setBudgets(data);
    } catch (err: any) {
      console.error("Erro ao buscar orçamentos:", err);
      setError("Não foi possível carregar os orçamentos.");
      toast.error("Erro ao carregar orçamentos.");
    }
  };

  const fetchBudgetSummary = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");

      const { data } = await axios.get(`/api/budgets/summary?month=${selectedMonth}&year=${selectedYear}`, { headers });
      setBudgetSummary(data);
    } catch (err: any) {
      console.error("Erro ao buscar resumo de orçamentos:", err);
      setError("Não foi possível carregar o resumo de orçamentos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");

      const budgetData = {
        category: budgetForm.category,
        amount: parseFloat(budgetForm.amount),
        month: budgetForm.month,
        year: budgetForm.year,
        notes: budgetForm.notes
      };

      if (editingBudget) {
        // Atualizar orçamento existente
        await axios.put(`/api/budgets/${editingBudget._id}`, budgetData, { headers });
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        // Criar novo orçamento
        await axios.post('/api/budgets', budgetData, { headers });
        toast.success("Orçamento criado com sucesso!");
      }

      // Reset form
      setBudgetForm({
        category: '',
        amount: '',
        month: selectedMonth,
        year: selectedYear,
        notes: ''
      });
      setEditingBudget(null);
      setShowNewBudgetDialog(false);
      setShowEditDialog(false);
      
      // Recarregar dados
      fetchBudgets();
      fetchBudgetSummary();

    } catch (err: any) {
      console.error("Erro ao salvar orçamento:", err);
      toast.error(err.response?.data?.message || "Erro ao salvar orçamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year,
      notes: budget.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");

      await axios.delete(`/api/budgets/${budgetId}`, { headers });
      toast.success("Orçamento excluído com sucesso!");
      
      fetchBudgets();
      fetchBudgetSummary();
    } catch (err: any) {
      console.error("Erro ao excluir orçamento:", err);
      toast.error("Erro ao excluir orçamento.");
    }
  };

  const handleCopyPrevious = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Usuário não autenticado.");

      await axios.post('/api/budgets/copy-previous', {
        month: selectedMonth,
        year: selectedYear
      }, { headers });
      
      toast.success("Orçamentos copiados do mês anterior!");
      fetchBudgets();
      fetchBudgetSummary();
    } catch (err: any) {
      console.error("Erro ao copiar orçamentos:", err);
      toast.error(err.response?.data?.message || "Erro ao copiar orçamentos.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'danger':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (isLoading && !budgetSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Orçamentos</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie seus orçamentos por categoria
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopyPrevious}
            disabled={isLoading}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Mês Anterior
          </Button>
          <Button onClick={() => setShowNewBudgetDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Período</CardTitle>
          <CardDescription>
            Selecione o mês e ano para visualizar os orçamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="month">Mês</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Ano</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      {budgetSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo Geral - {months.find(m => m.value === budgetSummary.month)?.label} {budgetSummary.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Orçado</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(budgetSummary.totals.budgeted)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Gasto</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(budgetSummary.totals.spent)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Restante</p>
                <p className={`text-lg font-bold ${budgetSummary.totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(budgetSummary.totals.remaining)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className={`text-lg font-bold ${getStatusColor(budgetSummary.totals.status).split(' ')[0]}`}>
                  {budgetSummary.totals.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral</span>
                <span className={`font-medium ${getStatusColor(budgetSummary.totals.status).split(' ')[0]}`}>
                  {budgetSummary.totals.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={budgetSummary.totals.percentage} 
                className={cn(
                  "h-3",
                  budgetSummary.totals.status === 'danger' && "[&>div]:bg-red-500",
                  budgetSummary.totals.status === 'warning' && "[&>div]:bg-yellow-500",
                  budgetSummary.totals.status === 'safe' && "[&>div]:bg-green-500"
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Orçamentos por Categoria */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Orçamentos por Categoria</h2>
        
        {budgetSummary && budgetSummary.categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetSummary.categories.map((category) => (
              <Card key={category._id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{category.category}</CardTitle>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                        {getStatusIcon(category.status)}
                        {category.status === 'safe' && 'No controle'}
                        {category.status === 'warning' && 'Atenção'}
                        {category.status === 'danger' && 'Limite excedido'}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          const budget = budgets.find(b => b.category === category.category);
                          if (budget) handleEdit(budget);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            const budget = budgets.find(b => b.category === category.category);
                            if (budget) handleDelete(budget._id);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Orçado</span>
                        <span className="font-medium">{formatCurrency(category.budgeted)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gasto</span>
                        <span className="font-medium text-red-600">{formatCurrency(category.spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Restante</span>
                        <span className={`font-medium ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(category.remaining)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{category.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={category.percentage} 
                        className={cn(
                          "h-2",
                          category.status === 'danger' && "[&>div]:bg-red-500",
                          category.status === 'warning' && "[&>div]:bg-yellow-500",
                          category.status === 'safe' && "[&>div]:bg-green-500"
                        )}
                      />
                    </div>
                    
                    {category.notes && (
                      <p className="text-xs text-muted-foreground">{category.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum orçamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro orçamento para começar a controlar seus gastos por categoria.
              </p>
              <Button onClick={() => setShowNewBudgetDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Novo Orçamento */}
      <Dialog open={showNewBudgetDialog} onOpenChange={setShowNewBudgetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>
              Defina um orçamento para uma categoria específica.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="amount">Valor do Orçamento</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm(prev => ({...prev, amount: e.target.value}))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="month">Mês</Label>
                  <Select value={budgetForm.month.toString()} onValueChange={(value) => setBudgetForm(prev => ({...prev, month: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="year">Ano</Label>
                  <Select value={budgetForm.year.toString()} onValueChange={(value) => setBudgetForm(prev => ({...prev, year: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre este orçamento..."
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                />
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
                    Criar Orçamento
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
            <DialogTitle>Editar Orçamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do orçamento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="edit-amount">Valor do Orçamento</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm(prev => ({...prev, amount: e.target.value}))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="edit-month">Mês</Label>
                  <Select value={budgetForm.month.toString()} onValueChange={(value) => setBudgetForm(prev => ({...prev, month: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="edit-year">Ano</Label>
                  <Select value={budgetForm.year.toString()} onValueChange={(value) => setBudgetForm(prev => ({...prev, year: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="edit-notes">Observações (opcional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Adicione observações sobre este orçamento..."
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                />
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
                    <Pencil className="mr-2 h-4 w-4" />
                    Atualizar Orçamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 