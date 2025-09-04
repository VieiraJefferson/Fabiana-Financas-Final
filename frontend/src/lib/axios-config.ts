import axios from 'axios';

// Configuração global do axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // CRÍTICO: enviar cookies em todas as requisições
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Log de requisições em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Log de respostas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        await axios.post('/api/users/refresh', {}, {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
          withCredentials: true,
        });

        // Repetir a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar o refresh, redirecionar para login
        console.error('❌ Falha na renovação do token:', refreshError);
        
        // Em um app real, você redirecionaria para login aqui
        // window.location.href = '/login';
        
        return Promise.reject(error);
      }
    }

    // Log de erros
    if (error.response) {
      console.error(`❌ ${error.response.status} ${error.response.statusText}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ Erro de rede:', error.request);
    } else {
      console.error('❌ Erro:', error.message);
    }

    return Promise.reject(error);
  }
);

// Configuração global do axios
axios.defaults.withCredentials = true;

export default api;
