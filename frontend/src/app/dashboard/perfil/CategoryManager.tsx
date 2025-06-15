"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, PlusCircle, Trash, Edit, Loader2 } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    type: 'receita' | 'despesa';
}

export default function CategoryManager() {
    const { getAuthHeaders } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const { data } = await axios.get('/api/categories', { headers });
            setCategories(data);
        } catch (error) {
            toast.error('Não foi possível carregar as categorias.');
        } finally {
            setLoading(false);
        }
    };

    // Efeito para buscar as categorias ao montar o componente
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSaveCategory = async () => {
        if (!currentCategory || !currentCategory.name || !currentCategory.type) {
            toast.error('Nome e tipo são obrigatórios.');
            return;
        }

        const headers = getAuthHeaders();
        const apiCall = currentCategory._id
            ? axios.put(`/api/categories/${currentCategory._id}`, currentCategory, { headers })
            : axios.post('/api/categories', currentCategory, { headers });

        try {
            await apiCall;
            toast.success(`Categoria ${currentCategory._id ? 'atualizada' : 'criada'} com sucesso.`);
            setDialogOpen(false);
            setCurrentCategory(null);
            fetchCategories(); // Recarrega a lista
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ocorreu um erro.';
            toast.error(errorMessage);
        }
    };
    
    const handleDeleteCategory = async (id: string) => {
        try {
            const headers = getAuthHeaders();
            await axios.delete(`/api/categories/${id}`, { headers });
            setCategories(categories.filter((cat) => cat._id !== id));
            toast.success('Categoria removida com sucesso!');
        } catch (error) {
            console.error('Erro ao remover categoria:', error);
            toast.error('Erro ao remover categoria.');
        }
    };

    const openEditDialog = (category: Category) => {
        setCurrentCategory(category);
        setDialogOpen(true);
    };

    const openNewDialog = () => {
        setCurrentCategory({ name: '', type: 'despesa' });
        setDialogOpen(true);
    };

    const handleAddCategory = async () => {
        try {
            const headers = getAuthHeaders();
            const { data: newCategory } = await axios.post('/api/categories', { name: newCategoryName }, { headers });
            setCategories([...categories, newCategory]);
            setNewCategoryName('');
            toast.success('Categoria adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            toast.error('Erro ao adicionar categoria.');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gerenciar Categorias</CardTitle>
                    <CardDescription>Adicione, edite ou remova suas categorias de transações.</CardDescription>
                </div>
                <Button onClick={openNewDialog}><PlusCircle className="mr-2 h-4 w-4" /> Nova Categoria</Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category._id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            category.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {category.type === 'receita' ? 'Receita' : 'Despesa'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCategory(category._id)}>
                                                <Trash className="mr-2 h-4 w-4" /> Deletar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentCategory?._id ? 'Editar' : 'Nova'} Categoria</DialogTitle>
                        <DialogDescription>
                            Preencha as informações da categoria.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Categoria</Label>
                            <Input
                                id="name"
                                value={currentCategory?.name || ''}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                placeholder="Ex: Supermercado, Salário"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select
                                value={currentCategory?.type || 'despesa'}
                                onValueChange={(value: 'receita' | 'despesa') => setCurrentCategory({ ...currentCategory, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="receita">Receita</SelectItem>
                                    <SelectItem value="despesa">Despesa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={handleSaveCategory}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 