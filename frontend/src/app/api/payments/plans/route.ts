import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:5001';

export async function GET() {
  try {
    console.log('Tentando buscar planos do backend:', `${BACKEND_URL}/api/payments/plans`);
    
    const response = await fetch(`${BACKEND_URL}/api/payments/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Resposta do backend:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do backend:', errorText);
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Dados recebidos do backend:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor ao buscar planos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 