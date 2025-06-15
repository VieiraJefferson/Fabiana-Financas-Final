"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Image as ImageIcon, Plus, Trash2, Loader2, Camera, KeyRound, Tag, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import CategoryManager from "./CategoryManager";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import UpdatePasswordForm from "./UpdatePasswordForm";
import UpdateProfileForm from "./UpdateProfileForm";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  type: 'receita' | 'despesa';
  isDefault?: boolean;
}

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const { getAuthHeaders } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryType, setCategoryType] = useState<'receita' | 'despesa'>('receita');
  const [newCategoryName, setNewCategoryName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setName(session.user?.name ?? "");
      setEmail(session.user?.email ?? "");
    }
  }, [session]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const headers = getAuthHeaders();
      const { data } = await axios.get('/api/categories', { headers });
      setCategories(data);
    } catch (error) {
      toast.error("Erro ao carregar categorias.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const headers = getAuthHeaders();
      await axios.put("/api/users/profile", { name, email }, { headers });
      await update({ name, email });
      toast.success("Seu perfil foi atualizado.");
    } catch (error) {
      toast.error("Não foi possível atualizar o perfil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos de senha.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }

    setPasswordLoading(true);
    try {
      const headers = getAuthHeaders();
      await axios.put("/api/users/password", { currentPassword, newPassword }, { headers });
      toast.success("Sua senha foi alterada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Não foi possível alterar a senha.";
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    
    setPhotoLoading(true);
    try {
      const headers = getAuthHeaders();
      const { data } = await axios.post("/api/users/profile/photo", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      await update({ image: data.image });
      toast.success(data.message);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Não foi possível enviar a foto.";
      toast.error(errorMessage);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleAddCategory = (type: 'receita' | 'despesa') => {
    setCategoryType(type);
    setNewCategoryName('');
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`/api/categories/${categoryId}`, { headers });
      toast.success("Categoria excluída com sucesso.");
      fetchCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Não foi possível excluir a categoria.";
      toast.error(errorMessage);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast.error("O nome da categoria é obrigatório.");
      return;
    }

    try {
      const headers = getAuthHeaders();
      await axios.post('/api/categories', {
        name: newCategoryName.trim(),
        type: categoryType
      }, { headers });

      toast.success("Categoria criada com sucesso.");
      setNewCategoryName('');
      setShowCategoryDialog(false);
      fetchCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Não foi possível criar a categoria.";
      toast.error(errorMessage);
    }
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // Implementar lógica de ativação/desativação
  };

  const categoriasFiltradas = {
    receitas: categories.filter(cat => cat.type === 'receita'),
    despesas: categories.filter(cat => cat.type === 'despesa')
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Perfil e Configurações</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="perfil" className="flex items-center gap-2 data-[state=active]:text-primary">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2 data-[state=active]:text-primary">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center gap-2 data-[state=active]:text-primary">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Categorias</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 mt-4">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Editar Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais. Clique em salvar quando terminar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                      <AvatarImage src={session?.user?.image} alt={session?.user?.name ?? ""} />
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoLoading}
                    >
                      {photoLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={profileLoading}
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4 mt-4">
          <Card>
            <form onSubmit={handlePasswordChange}>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Alterar Senha</CardTitle>
                <CardDescription>
                  Mantenha sua conta segura alterando sua senha periodicamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2 space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    'Atualizar Senha'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Autenticação em Duas Etapas</CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                      {twoFactorEnabled ? 'Ativado' : 'Desativado'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorEnabled
                      ? 'A autenticação em duas etapas está ativa em sua conta.'
                      : 'Ative a autenticação em duas etapas para maior segurança.'}
                  </p>
                </div>
                <Button
                  variant={twoFactorEnabled ? "destructive" : "default"}
                  onClick={toggleTwoFactor}
                  className="w-full sm:w-auto"
                >
                  {twoFactorEnabled ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Categorias Personalizadas</CardTitle>
              <CardDescription>
                Gerencie suas categorias de receitas e despesas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      Receitas
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddCategory('receita')}>
                      <Plus className="h-4 w-4 mr-1" /> 
                      <span className="hidden sm:inline">Adicionar</span>
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-2 pr-4">
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center h-[160px]">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : categoriasFiltradas.receitas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[160px] text-center space-y-2">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Nenhuma categoria de receita encontrada</p>
                          <Button variant="link" size="sm" onClick={() => handleAddCategory('receita')}>
                            Adicionar categoria
                          </Button>
                        </div>
                      ) : (
                        categoriasFiltradas.receitas.map((categoria) => (
                          <div 
                            key={categoria._id} 
                            className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <span className="font-medium">{categoria.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteCategory(categoria._id)}
                              disabled={categoria.isDefault}
                              title={categoria.isDefault ? "Categorias padrão não podem ser excluídas" : "Excluir categoria"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      Despesas
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddCategory('despesa')}>
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Adicionar</span>
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-2 pr-4">
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center h-[160px]">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : categoriasFiltradas.despesas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[160px] text-center space-y-2">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Nenhuma categoria de despesa encontrada</p>
                          <Button variant="link" size="sm" onClick={() => handleAddCategory('despesa')}>
                            Adicionar categoria
                          </Button>
                        </div>
                      ) : (
                        categoriasFiltradas.despesas.map((categoria) => (
                          <div 
                            key={categoria._id} 
                            className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <span className="font-medium">{categoria.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteCategory(categoria._id)}
                              disabled={categoria.isDefault}
                              title={categoria.isDefault ? "Categorias padrão não podem ser excluídas" : "Excluir categoria"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar categoria */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {categoryType === 'receita' ? (
                <ArrowUpCircle className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-red-500" />
              )}
              Nova Categoria de {categoryType === 'receita' ? 'Receita' : 'Despesa'}
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar suas {categoryType === 'receita' ? 'receitas' : 'despesas'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="flex items-center gap-2">
                Nome da Categoria <span className="text-destructive">*</span>
              </Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={`Ex: ${categoryType === 'receita' ? 'Salário, Freelance' : 'Alimentação, Transporte'}`}
                className="h-10"
                maxLength={50}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Máximo de 50 caracteres</span>
                <span>{newCategoryName.length}/50</span>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCategoryDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={!newCategoryName.trim() || newCategoryName.length > 50}
              >
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 