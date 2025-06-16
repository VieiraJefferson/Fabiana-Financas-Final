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
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Save, Loader2, Calendar as CalendarIcon, Info, PlusCircle } from "lucide-react";
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

// Interface para categoria (frontend)
interface ICategory {
  _id: string;
  name: string;
  type: 'receita' | 'despesa';
  isDefault?: boolean;
}

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
              <PlusCircle className="h-5 w-5" />
              <h1 className="text-lg font-bold">Nova Transação</h1>
            </div>
          </div>
          <p className="text-sm opacity-90">
            Adicione uma nova receita ou despesa
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="h-10 px-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Nova Transação</h1>
            </div>
            <p className="text-muted-foreground">
              Adicione uma nova receita ou despesa ao seu controle financeiro
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 overflow-x-hidden">
          <div className="max-w-2xl mx-auto">
            {/* Form Card */}
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Detalhes da Transação
                </CardTitle>
                <CardDescription>
                  Preencha as informações da sua movimentação financeira
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="text-sm p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo - Mobile first */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
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
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">
                          <div className="flex items-center gap-3 py-1">
                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Receita</div>
                              <div className="text-xs text-muted-foreground">Dinheiro que entra</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="despesa">
                          <div className="flex items-center gap-3 py-1">
                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                            <div>
                              <div className="font-medium">Despesa</div>
                              <div className="text-xs text-muted-foreground">Dinheiro que sai</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Valor */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-2 text-sm font-medium">
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
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center justify-between text-sm font-medium">
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
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                      Categoria <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                      disabled={!formData.type || categoriesLoading}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={
                          categoriesLoading ? "Carregando categorias..." : (formData.type ? "Selecione a categoria" : "Primeiro selecione o tipo")
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasFiltradas.length > 0 ? (
                          categoriasFiltradas.map((categoria) => (
                            <SelectItem key={(categoria as any)._id || categoria.name} value={categoria.name}>
                              <div className="py-1">
                                <div className="font-medium">{categoria.name}</div>
                              </div>
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

                  {/* Data */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                      Data <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal text-base",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5" />
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

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="flex items-center justify-between text-sm font-medium">
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
                      rows={4}
                      className="min-h-[100px] resize-y text-base"
                    />
                  </div>

                  {/* Botões - Mobile optimized */}
                  <div className="flex flex-col gap-3 pt-6">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Salvar Transação
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}