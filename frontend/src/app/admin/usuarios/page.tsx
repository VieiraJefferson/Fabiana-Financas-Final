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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'basic' | 'advanced' | 'premium';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  isAdmin: boolean;
  totalSpent: number;
  videosWatched: number;
}

interface UserForm {
  name: string;
  email: string;
  plan: string;
  status: string;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    plan: 'basic',
    status: 'active',
    isAdmin: false
  });

  // Dados mockados - substituir por dados reais da API
  useEffect(() => {
    setUsers([
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria@email.com',
        plan: 'premium',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20T10:30:00Z',
        isAdmin: false,
        totalSpent: 299.99,
        videosWatched: 45
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao@email.com',
        plan: 'advanced',
        status: 'active',
        createdAt: '2024-01-10',
        lastLogin: '2024-01-19T15:20:00Z',
        isAdmin: false,
        totalSpent: 179.99,
        videosWatched: 28
      },
      {
        id: '3',
        name: 'Ana Costa',
        email: 'ana@email.com',
        plan: 'basic',
        status: 'inactive',
        createdAt: '2024-01-08',
        lastLogin: '2024-01-18T09:45:00Z',
        isAdmin: false,
        totalSpent: 89.99,
        videosWatched: 12
      },
      {
        id: '4',
        name: 'Carlos Oliveira',
        email: 'carlos@email.com',
        plan: 'premium',
        status: 'active',
        createdAt: '2024-01-05',
        lastLogin: '2024-01-20T14:15:00Z',
        isAdmin: false,
        totalSpent: 599.98,
        videosWatched: 67
      },
      {
        id: '5',
        name: 'Fabiana Admin',
        email: 'admin@fabifinancas.com',
        plan: 'premium',
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-20T16:00:00Z',
        isAdmin: true,
        totalSpent: 0,
        videosWatched: 89
      }
    ]);
  }, []);

  const plans = [
    { value: 'basic', label: 'Basic', color: 'bg-blue-100 text-blue-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
    { value: 'premium', label: 'Premium', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const statuses = [
    { value: 'active', label: 'Ativo', color: 'text-success bg-success/10' },
    { value: 'inactive', label: 'Inativo', color: 'text-warning bg-warning/10' },
    { value: 'suspended', label: 'Suspenso', color: 'text-danger bg-danger/10' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser: User = {
        id: editingUser?.id || Date.now().toString(),
        name: userForm.name,
        email: userForm.email,
        plan: userForm.plan as User['plan'],
        status: userForm.status as User['status'],
        isAdmin: userForm.isAdmin,
        createdAt: editingUser?.createdAt || new Date().toISOString(),
        lastLogin: editingUser?.lastLogin || new Date().toISOString(),
        totalSpent: editingUser?.totalSpent || 0,
        videosWatched: editingUser?.videosWatched || 0
      };

      if (editingUser) {
        setUsers(prev => prev.map(user => user.id === editingUser.id ? updatedUser : user));
        setSuccess("Usuário atualizado com sucesso!");
      } else {
        setUsers(prev => [...prev, updatedUser]);
        setSuccess("Usuário criado com sucesso!");
      }

      // Reset form
      setUserForm({
        name: '',
        email: '',
        plan: 'basic',
        status: 'active',
        isAdmin: false
      });
      setEditingUser(null);
      setIsDialogOpen(false);

    } catch (err: any) {
      setError("Erro ao salvar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      plan: user.plan,
      status: user.status,
      isAdmin: user.isAdmin
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess("Usuário excluído com sucesso!");
    }
  };

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    setSuccess("Status do usuário atualizado!");
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj?.color || 'text-muted-foreground bg-muted';
  };

  const getPlanColor = (plan: string) => {
    const planObj = plans.find(p => p.value === plan);
    return planObj?.color || 'bg-gray-100 text-gray-800';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Estatísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const premiumUsers = users.filter(u => u.plan === 'premium').length;
  const totalRevenue = users.reduce((acc, user) => acc + user.totalSpent, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários da plataforma
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setUserForm({
                name: '',
                email: '',
                plan: 'basic',
                status: 'active',
                isAdmin: false
              });
            }}>
              👤 Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Atualize as informações do usuário' : 'Crie um novo usuário na plataforma'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Ex: Maria Silva"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({...prev, name: e.target.value}))}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="usuario@email.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({...prev, email: e.target.value}))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Plano</Label>
                  <Select value={userForm.plan} onValueChange={(value) => setUserForm(prev => ({...prev, plan: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={userForm.status} onValueChange={(value) => setUserForm(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={userForm.isAdmin}
                    onChange={(e) => setUserForm(prev => ({...prev, isAdmin: e.target.checked}))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isAdmin">Usuário Administrador</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : editingUser ? "Atualizar" : "Criar Usuário"}
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
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeUsers / totalUsers) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((premiumUsers / totalUsers) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍</span>
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Planos</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Usuários ({filteredUsers.length})
        </h2>
        
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterPlan !== 'all' || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Nenhum usuário cadastrado ainda'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-lg font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Avatar>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>📅 Cadastro: {formatDate(user.createdAt)}</span>
                            <span>🕒 Último login: {formatDateTime(user.lastLogin)}</span>
                            <span>🎥 {user.videosWatched} vídeos assistidos</span>
                            <span>💰 {formatCurrency(user.totalSpent)} gasto</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanColor(user.plan)}`}>
                            {plans.find(p => p.value === user.plan)?.label}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                            {statuses.find(s => s.value === user.status)?.label}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                          ✏️ Editar
                        </Button>
                        
                        <Select 
                          value={user.status} 
                          onValueChange={(value) => handleStatusChange(user.id, value as User['status'])}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {!user.isAdmin && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(user.id)}
                          >
                            🗑️ Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 