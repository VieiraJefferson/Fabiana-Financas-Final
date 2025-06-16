import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// URL do backend
const API_URL = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro ao buscar meta' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro ao atualizar meta' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json({ message: data.message || 'Erro ao excluir meta' }, { status: response.status });
    }

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 