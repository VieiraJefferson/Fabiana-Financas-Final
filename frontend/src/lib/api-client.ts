import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import { API_CONFIG, ApiResponse } from './api-config';

// Classe para gerenciar o cliente HTTP
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        } catch (error) {
          console.warn('Erro ao obter sessão:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratamento de respostas
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Log do erro para debugging
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
        });

        // Tratamento específico para diferentes tipos de erro
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          console.warn('Token de autenticação inválido ou expirado');
          // Aqui você pode implementar logout automático se necessário
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP genéricos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Tratamento padronizado de respostas
  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
    };
  }

  // Tratamento padronizado de erros
  private handleError(error: any): ApiResponse {
    const message = error.response?.data?.message || error.message || 'Erro desconhecido';
    
    return {
      success: false,
      error: message,
      message,
    };
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient();

// Funções específicas para cada recurso
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
  
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
  
  getProfile: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE),
};

export const transactionsApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; category?: string }) =>
    apiClient.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE, { params }),
  
  getById: (id: string) =>
    apiClient.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.BY_ID(id)),
  
  create: (transaction: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE, transaction),
  
  update: (id: string, transaction: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.TRANSACTIONS.BY_ID(id), transaction),
  
  delete: (id: string) =>
    apiClient.delete(API_CONFIG.ENDPOINTS.TRANSACTIONS.BY_ID(id)),
  
  getSummary: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.SUMMARY),
};

export const categoriesApi = {
  getAll: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES.BASE),
  
  getById: (id: string) =>
    apiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID(id)),
  
  create: (category: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.CATEGORIES.BASE, category),
  
  update: (id: string, category: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID(id), category),
  
  delete: (id: string) =>
    apiClient.delete(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID(id)),
};

export const goalsApi = {
  getAll: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.GOALS.BASE),
  
  getById: (id: string) =>
    apiClient.get(API_CONFIG.ENDPOINTS.GOALS.BY_ID(id)),
  
  create: (goal: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.GOALS.BASE, goal),
  
  update: (id: string, goal: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.GOALS.BY_ID(id), goal),
  
  delete: (id: string) =>
    apiClient.delete(API_CONFIG.ENDPOINTS.GOALS.BY_ID(id)),
}; 