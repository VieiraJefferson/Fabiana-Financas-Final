import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// URL do backend
const API_URL = process.env.NEXTAUTH_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.log('GET /api/transactions - Não autorizado: Token ausente');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  console.log('=== DEBUG GET TRANSACTIONS FRONTEND ===');
  console.log('Token:', token.accessToken ? 'Presente' : 'Ausente');
  console.log('URL do backend:', API_URL);

  try {
    // Obter parâmetros de query
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    
    // Fazer requisição para o backend
    const backendUrl = `${API_URL}/api/transactions${queryString ? `?${queryString}` : ''}`;
    console.log(`Fazendo requisição GET para ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    console.log('Resposta do backend:', response.status);
    const data = await response.json();
    console.log('Dados recebidos:', data);

    if (!response.ok) {
      console.log('Erro na resposta:', response.status, data);
      return NextResponse.json({ message: data.message || 'Erro ao buscar transações' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    console.log('POST /api/transactions - Não autorizado: Token ausente');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  console.log('=== DEBUG POST TRANSACTION FRONTEND ===');
  console.log('Token:', token.accessToken ? 'Presente' : 'Ausente');
  console.log('URL do backend:', API_URL);

  try {
    const body = await req.json();
    console.log('Corpo da requisição:', body);
    
    // Fazer requisição para o backend
    console.log(`Fazendo requisição POST para ${API_URL}/api/transactions`);
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.accessToken}`,
    });
    
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    console.log('Resposta do backend (status):', response.status);
    const data = await response.json();
    console.log('Dados recebidos:', data);

    if (!response.ok) {
      console.log('Erro na resposta:', response.status, data);
      return NextResponse.json({ message: data.message || 'Erro ao criar transação' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar transação:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 