import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const API_URL = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    console.log('❌ Profile API: Token não encontrado');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('📤 Profile API: Recebido body:', { 
      hasName: !!body.name,
      hasEmail: !!body.email,
      hasImage: !!body.image,
      imageSize: body.image ? body.image.length : 0
    });
    
    // Fazer requisição para o backend
    console.log('🔄 Profile API: Enviando para backend:', `${API_URL}/api/users/profile`);
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('📥 Profile API: Resposta do backend:', response.status, { 
      success: response.ok,
      hasUser: !!data.user,
      hasMessage: !!data.message 
    });

    if (!response.ok) {
      console.log('❌ Profile API: Erro do backend:', data);
      return NextResponse.json({ message: data.message || 'Erro ao atualizar perfil' }, { status: response.status });
    }

    console.log('✅ Profile API: Sucesso!');
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("❌ Profile API: Erro interno:", error);
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    }, { status: 500 });
  }
} 