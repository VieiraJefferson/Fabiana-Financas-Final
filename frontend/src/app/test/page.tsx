"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

export default function TestPage() {
  const { session, getAuthHeaders, getAuthToken } = useAuth();
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const testPublicRoute = async () => {
    try {
      console.log('Testando rota pública...');
      const response = await axios.get('/api/test/public');
      addResult('Rota Pública', true, response.data);
    } catch (error: any) {
      addResult('Rota Pública', false, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
  };

  const testProtectedRoute = async () => {
    try {
      console.log('Testando rota protegida...');
      const headers = getAuthHeaders();
      console.log('Headers enviados:', headers);
      
      if (!headers) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await axios.get('/api/test/protected', { headers });
      addResult('Rota Protegida', true, response.data);
    } catch (error: any) {
      addResult('Rota Protegida', false, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
  };

  const testCategoriesRoute = async () => {
    try {
      console.log('Testando rota de categorias...');
      const headers = getAuthHeaders();
      console.log('Headers enviados:', headers);
      
      if (!headers) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await axios.get('/api/categories', { headers });
      addResult('Categorias', true, response.data);
    } catch (error: any) {
      addResult('Categorias', false, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
  };

  const testGoalsRoute = async () => {
    try {
      console.log('Testando rota de metas...');
      const headers = getAuthHeaders();
      console.log('Headers enviados:', headers);
      
      if (!headers) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await axios.get('/api/goals', { headers });
      addResult('Metas', true, response.data);
    } catch (error: any) {
      addResult('Metas', false, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Página de Testes - Debug API</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              authenticated: !!session?.user,
              user: session?.user,
              hasToken: !!getAuthToken(),
              token: getAuthToken() ? getAuthToken()?.substring(0, 20) + '...' : null
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testes de API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testPublicRoute}>Testar Rota Pública</Button>
            <Button onClick={testProtectedRoute}>Testar Rota Protegida</Button>
            <Button onClick={testCategoriesRoute}>Testar Categorias</Button>
            <Button onClick={testGoalsRoute}>Testar Metas</Button>
            <Button onClick={clearResults} variant="outline">Limpar Resultados</Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded border ${result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <h3 className="font-semibold">
                    {result.test} - {result.success ? '✅ Sucesso' : '❌ Erro'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{result.timestamp}</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 