#!/bin/bash

echo "🚀 Instalando dependências para o novo sistema de autenticação..."

# Backend dependencies
echo "📦 Instalando dependências do backend..."
cd backend
npm install cookie-parser cors helmet
echo "✅ Backend dependencies instaladas"

# Frontend dependencies
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies instaladas"

echo ""
echo "🎉 Todas as dependências foram instaladas com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente (.env)"
echo "2. Teste o backend: cd backend && node testNewAuth.js"
echo "3. Teste o frontend: cd frontend && npm run dev"
echo ""
echo "📚 Consulte AUTHENTICATION_SETUP.md para mais detalhes"
