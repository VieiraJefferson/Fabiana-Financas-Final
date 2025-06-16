import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// URL do backend
const API_URL = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro ao criar categoria' }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  console.log('=== DEBUG CATEGORIES API ROUTE ===');
  console.log('NEXTAUTH_BACKEND_URL:', process.env.NEXTAUTH_BACKEND_URL);
  console.log('API_URL:', API_URL);
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('Token exists:', !!token);
  console.log('Token accessToken:', token?.accessToken ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token found - returning 401');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const backendUrl = `${API_URL}/api/categories`;
    console.log('Fetching from backend:', backendUrl);
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro ao buscar categorias' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 