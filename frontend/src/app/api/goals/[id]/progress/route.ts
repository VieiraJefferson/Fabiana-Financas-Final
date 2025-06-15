import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// URL do backend
const API_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/goals/${params.id}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro ao atualizar progresso da meta' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar progresso da meta:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 