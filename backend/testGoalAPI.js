const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// URL do backend
const API_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// Função para testar a API de metas
const testGoalAPI = async () => {
  try {
    // Testar a rota de teste (não autenticada)
    console.log('Testando rota de teste...');
    const testResponse = await axios.get(`${API_URL}/api/goals/test`);
    console.log('Resposta da rota de teste:', testResponse.data);
    console.log('Status:', testResponse.status);

    // Obter um token de autenticação
    console.log('\nObtendo token de autenticação...');
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
      email: 'admin@example.com', // Substitua por um email válido
      password: 'password123', // Substitua por uma senha válida
    });
    const token = loginResponse.data.token;
    console.log('Token obtido:', token ? 'Sim' : 'Não');

    if (token) {
      // Testar criação de meta
      console.log('\nTestando criação de meta...');
      const createResponse = await axios.post(
        `${API_URL}/api/goals`,
        {
          title: 'Meta de Teste via API',
          description: 'Esta é uma meta de teste criada via API',
          type: 'economia',
          targetAmount: 1000,
          currentAmount: 0,
          deadline: new Date('2024-12-31'),
          priority: 'media',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log('Resposta da criação de meta:', createResponse.data);
      console.log('Status:', createResponse.status);

      // Testar obtenção de metas
      console.log('\nTestando obtenção de metas...');
      const getResponse = await axios.get(`${API_URL}/api/goals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(`Encontradas ${getResponse.data.length} metas`);
      console.log('Status:', getResponse.status);
    }
  } catch (error) {
    console.error('Erro no teste da API:', error.message);
    if (error.response) {
      console.error('Dados da resposta de erro:', error.response.data);
      console.error('Status do erro:', error.response.status);
    }
  }
};

// Executar o teste
testGoalAPI(); 