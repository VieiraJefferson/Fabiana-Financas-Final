import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/backend/config/db';
import Category from '@/models/Category';
import { User } from '@/backend/models/userModel';

// Conecta ao banco uma única vez quando a rota é inicializada
connectDB();

// Parâmetros da rota
interface Params {
  id: string;
}

// Atualizar uma categoria
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json({ message: 'Categoria não encontrada' }, { status: 404 });
    }

    // Garante que o usuário só possa editar sua própria categoria
    if (category.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, type } = body;

    // Verificar se já existe outra categoria com o mesmo nome e tipo
    const existingCategory = await Category.findOne({ 
        name, 
        type, 
        user: user._id, 
        _id: { $ne: params.id } // Exclui a própria categoria da busca
    });
    if (existingCategory) {
        return NextResponse.json({ message: 'Você já possui outra categoria com este nome e tipo.' }, { status: 409 });
    }

    category.name = name || category.name;
    category.type = type || category.type;

    const updatedCategory = await category.save();

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Deletar uma categoria
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
  
    try {
      const user = await User.findOne({ email: token.email });
      if (!user) {
        return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
      }
  
      const category = await Category.findById(params.id);
  
      if (!category) {
        return NextResponse.json({ message: 'Categoria não encontrada' }, { status: 404 });
      }
  
      if (category.user.toString() !== user._id.toString()) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
      }

      // Opcional: Adicionar lógica para não permitir deletar categorias em uso
      // Por simplicidade, vamos permitir a exclusão por enquanto.
  
      await category.deleteOne();
  
      return NextResponse.json({ message: 'Categoria deletada com sucesso' }, { status: 200 });
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
    }
  } 