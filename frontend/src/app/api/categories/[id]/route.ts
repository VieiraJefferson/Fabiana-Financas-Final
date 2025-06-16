import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

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
    const body = await req.json();
    
    // Fazer proxy da requisição para o backend
    const response = await axios.put(
      `${BACKEND_URL}/api/categories/${params.id}`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error);
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data?.message || 'Erro no servidor' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Deletar uma categoria
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Fazer proxy da requisição para o backend
    const response = await axios.delete(
      `${BACKEND_URL}/api/categories/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("Erro ao deletar categoria:", error);
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data?.message || 'Erro no servidor' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 