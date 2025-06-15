"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Save, Loader2, Calendar as CalendarIcon, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ICategory } from "@/models/Category";

// Categorias predefinidas
const CATEGORIAS_RECEITA = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Vendas",
  "Outros"
];

const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Outros"
];

export default function NovaTransacaoPage() {
  const { data: session } = useSession();
  const { getAuthHeaders } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    category: "",
    date: new Date(),
    notes: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [notesLength, setNotesLength] = useState(0);

  // Buscar todas as categorias do usuário
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const headers = getAuthHeaders();
        if (headers) {
          const { data } = await axios.get('/api/categories', { headers });
          setAllCategories(data);
        }
      } catch (err) {
        toast.error("Erro ao carregar suas categorias.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [getAuthHeaders, toast]);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'description') {
      setDescriptionLength(value.length);
    } else if (field === 'notes') {
      setNotesLength(value.length);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'type' && { category: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const loadingToastId = toast.loading("Salvando transação...");

    // Validações
    if (!formData.type || !formData.amount || !formData.description || !formData.category) {
      toast.dismiss(loadingToastId);
      setError("Todos os campos obrigatórios devem ser preenchidos");
      toast.error("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.dismiss(loadingToastId);
      setError("O valor deve ser maior que zero");
      toast.error("O valor deve ser maior que zero.");
      setLoading(false);
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error("Usuário não autenticado.");
      }

      await axios.post("/api/transactions", {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date.toISOString(),
        notes: formData.notes,
      }, { headers });

      toast.dismiss(loadingToastId);
      toast.success("Transação salva com sucesso!");
      router.push("/dashboard");
      
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      const errorMessage = err.response?.data?.message || "Erro ao criar transação";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = formData.type
    ? allCategories.filter((c) => c.type === formData.type)
    : [];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="h-8 w-8 p-0 md:h-10 md:w-auto md:px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Voltar</span>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Nova Transação</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione uma nova receita ou despesa ao seu controle financeiro
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl">
              Detalhes da Transação
            </CardTitle>
            <CardDescription>
              Preencha as informações da sua movimentação financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 md:mb-6 text-sm p-3 md:p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Tipo e Valor - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    Tipo <span className="text-destructive">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Escolha se é uma receita (entrada) ou despesa (saída)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          <span>Receita</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="despesa">
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          <span>Despesa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    Valor (R$) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="h-10"
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Descrição <span className="text-destructive">*</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {descriptionLength}/200
                  </span>
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: Compra no supermercado, Salário mensal..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  maxLength={200}
                  className="h-10"
                  required
                />
              </div>

              {/* Categoria e Data - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={!formData.type || categoriesLoading}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={
                        categoriesLoading ? "Carregando categorias..." : (formData.type ? "Selecione a categoria" : "Primeiro selecione o tipo")
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasFiltradas.length > 0 ? (
                        categoriasFiltradas.map((categoria) => (
                          <SelectItem key={categoria._id} value={categoria.name}>
                            {categoria.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-category" disabled>
                          {formData.type ? "Nenhuma categoria encontrada" : "Selecione um tipo"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    Data <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && handleInputChange('date', date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center justify-between">
                  <span>Observações</span>
                  <span className="text-xs text-muted-foreground">
                    {notesLength}/500
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre esta transação (opcional)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="min-h-[80px] resize-y"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4 md:pt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Transação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 