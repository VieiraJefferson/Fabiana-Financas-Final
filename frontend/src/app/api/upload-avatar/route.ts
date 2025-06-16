import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const API_URL = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  console.log('🔥 === ROTA AVATAR NOVA SEM CACHE ===');
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    console.log('❌ Token não encontrado na rota avatar');
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  console.log('✅ Token encontrado na rota avatar');

  try {
    const formData = await req.formData();
    console.log('📥 FormData recebido na rota avatar');
    
    const file = formData.get('profileImage');
    console.log('📁 Arquivo no FormData:', file ? 'Presente' : 'Ausente');
    
    console.log('🔄 Enviando para backend Cloudinary:', `${API_URL}/api/users/profile/photo`);
    
    const response = await fetch(`${API_URL}/api/users/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log('📥 Resposta do backend Cloudinary - Status:', response.status);
    console.log('📥 Resposta do backend Cloudinary - Data:', data);

    if (!response.ok) {
      console.log('❌ Erro do backend Cloudinary:', data);
      return NextResponse.json({ message: data.message || 'Erro no upload' }, { status: response.status });
    }

    console.log('✅ Upload realizado com sucesso via Cloudinary!');
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro na rota avatar:", error);
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    }, { status: 500 });
  }
} 