import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const API_URL = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  console.log('=== DEBUG PROXY UPLOAD ===');
  console.log('URL do backend:', API_URL);
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('Token encontrado:', !!token);
  
  if (!token) {
    console.log('Token não encontrado');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Obter o FormData do request
    const formData = await req.formData();
    console.log('FormData recebido:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    // Criar novo FormData para enviar ao backend
    const backendFormData = new FormData();
    
    // Copiar todos os campos do FormData
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    console.log('Enviando para o backend...');
    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/users/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: backendFormData,
    });

    console.log('Resposta do backend:', response.status, response.statusText);
    const data = await response.json();
    console.log('Dados da resposta:', data);

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro ao fazer upload da foto' }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Erro no upload da foto:", error);
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    }, { status: 500 });
  }
} 