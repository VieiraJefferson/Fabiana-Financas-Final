// Configuração centralizada da API
export const API_CONFIG = {
  // URL base do backend - será diferente em desenvolvimento e produção
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://fabiana-financas-backend.onrender.com',
  
  // Endpoints da API
  ENDPOINTS: {
    // Autenticação
    AUTH: {
      LOGIN: '/api/users/login',
      REGISTER: '/api/users/register',
      PROFILE: '/api/users/profile',
    },
    
    // Transações
    TRANSACTIONS: {
      BASE: '/api/transactions',
      SUMMARY: '/api/transactions/summary',
      BY_ID: (id: string) => `/api/transactions/${id}`,
    },
    
    // Categorias
    CATEGORIES: {
      BASE: '/api/categories',
      BY_ID: (id: string) => `/api/categories/${id}`,
    },
    
    // Metas
    GOALS: {
      BASE: '/api/goals',
      BY_ID: (id: string) => `/api/goals/${id}`,
    },
    
    // Orçamentos
    BUDGETS: {
      BASE: '/api/budgets',
      BY_ID: (id: string) => `/api/budgets/${id}`,
    }
  }
};

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipos para paginação
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 