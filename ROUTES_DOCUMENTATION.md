# 📚 Documentação das Rotas da API - Fabiana Finanças

## 🚀 Visão Geral

A API está organizada de forma modular e limpa, com middlewares de autenticação aplicados individualmente em cada rota conforme necessário.

## 🔐 Autenticação

### Middlewares Disponíveis

- **`requireAuth()`** - Verifica se o usuário está autenticado
- **`requireRole('admin')`** - Verifica se o usuário tem role específico
- **`requireAdmin()`** - Verifica se o usuário é admin ou super_admin

### Uso nos Middlewares

```javascript
// Aplicar em rotas individuais
router.get('/me', requireAuth(), ctrl.getUserProfile);

// Aplicar em grupos de rotas
router.use(requireAuth()); // Todas as rotas abaixo precisam de autenticação
```

## 📍 Base URL

```
http://localhost:5000/api
```

## 👥 Rotas de Usuários (`/api/users`)

### Rotas Públicas

| Método | Rota | Descrição | Parâmetros |
|--------|------|-----------|------------|
| POST | `/register` | Registrar novo usuário | `name`, `email`, `password` |
| POST | `/login` | Login de usuário | `email`, `password` |
| POST | `/refresh` | Renovar tokens | - |
| POST | `/logout` | Logout da sessão atual | - |

### Rotas Protegidas

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/me` | Perfil do usuário | `requireAuth()` |
| PUT | `/me` | Atualizar perfil | `requireAuth()` |
| PUT | `/password` | Alterar senha | `requireAuth()` |
| POST | `/profile/photo` | Upload de foto | `requireAuth()` |
| POST | `/logout-all` | Logout de todas as sessões | `requireAuth()` |
| GET | `/sessions` | Estatísticas de sessões | `requireAuth()` |
| GET | `/debug-image` | Debug de imagem de perfil | `requireAuth()` |

### Exemplos de Uso

#### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123"}'
```

#### Obter Perfil (com cookies)
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Cookie: access_token=your_access_token"
```

## 👑 Rotas de Administração (`/api/admin`)

### Rotas Públicas

| Método | Rota | Descrição | Parâmetros |
|--------|------|-----------|------------|
| POST | `/login` | Login de administrador | `email`, `password` |

### Rotas Protegidas (Admin)

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/me` | Perfil do admin | `requireAuth()`, `requireRole('admin')` |
| POST | `/logout` | Logout de admin | `requireAuth()`, `requireRole('admin')` |
| GET | `/users` | Listar usuários | `requireAuth()`, `requireRole('admin')` |
| GET | `/users/:id` | Detalhes do usuário | `requireAuth()`, `requireRole('admin')` |
| PUT | `/users/:id` | Atualizar usuário | `requireAuth()`, `requireRole('admin')` |
| PATCH | `/users/:id/toggle-status` | Ativar/desativar usuário | `requireAuth()`, `requireRole('admin')` |
| POST | `/users/:id/revoke-sessions` | Revogar sessões | `requireAuth()`, `requireRole('admin')` |
| GET | `/stats` | Estatísticas do sistema | `requireAuth()`, `requireRole('admin')` |

### Exemplos de Uso

#### Login de Admin
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

#### Listar Usuários
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=20" \
  -H "Cookie: access_token=your_admin_token"
```

## 💰 Rotas de Transações (`/api/transactions`)

### Rotas Protegidas

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/` | Listar transações | `requireAuth()` |
| POST | `/` | Criar transação | `requireAuth()` |
| GET | `/:id` | Obter transação | `requireAuth()` |
| PUT | `/:id` | Atualizar transação | `requireAuth()` |
| DELETE | `/:id` | Deletar transação | `requireAuth()` |

## 🎯 Rotas de Metas (`/api/goals`)

### Rotas Protegidas

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/` | Listar metas | `requireAuth()` |
| POST | `/` | Criar meta | `requireAuth()` |
| GET | `/:id` | Obter meta | `requireAuth()` |
| PUT | `/:id` | Atualizar meta | `requireAuth()` |
| DELETE | `/:id` | Deletar meta | `requireAuth()` |

## 📊 Rotas de Orçamentos (`/api/budgets`)

### Rotas Protegidas

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/` | Listar orçamentos | `requireAuth()` |
| POST | `/` | Criar orçamento | `requireAuth()` |
| GET | `/:id` | Obter orçamento | `requireAuth()` |
| PUT | `/:id` | Atualizar orçamento | `requireAuth()` |
| DELETE | `/:id` | Deletar orçamento | `requireAuth()` |

## 🏷️ Rotas de Categorias (`/api/categories`)

### Rotas Protegidas

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/` | Listar categorias | `requireAuth()` |
| POST | `/` | Criar categoria | `requireAuth()` |
| GET | `/:id` | Obter categoria | `requireAuth()` |
| PUT | `/:id` | Atualizar categoria | `requireAuth()` |
| DELETE | `/:id` | Deletar categoria | `requireAuth()` |

## 💳 Rotas de Pagamentos (`/api/payments`)

### Rotas Protegidas

| Método | Rota | Descrição | Middleware |
|--------|------|-----------|------------|
| GET | `/` | Listar pagamentos | `requireAuth()` |
| POST | `/` | Criar pagamento | `requireAuth()` |
| GET | `/:id` | Obter pagamento | `requireAuth()` |
| PUT | `/:id` | Atualizar pagamento | `requireAuth()` |
| DELETE | `/:id` | Deletar pagamento | `requireAuth()` |

## 🔍 Rotas de Sistema

### Health Check
```bash
GET /health
```

**Resposta:**
```json
{
  "ok": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234.56,
  "environment": "development"
}
```

### Informações da API
```bash
GET /api
```

**Resposta:**
```json
{
  "name": "Fabiana Finanças API",
  "version": "2.0.0",
  "description": "API robusta para sistema de finanças pessoais",
  "endpoints": {
    "users": "/api/users",
    "admin": "/api/admin",
    "budgets": "/api/budgets",
    "categories": "/api/categories",
    "goals": "/api/goals",
    "transactions": "/api/transactions",
    "payments": "/api/payments"
  },
  "documentation": "/api/docs",
  "health": "/api/health"
}
```

## 🛡️ Segurança

### Headers Necessários

- **Content-Type**: `application/json` para requisições com body
- **Cookie**: Para autenticação (access_token e refresh_token)

### CORS

- **Origins permitidas**: Configuradas no servidor
- **Credentials**: `true` para envio de cookies
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

### Cookies

- **access_token**: Para autenticação (path: `/`)
- **refresh_token**: Para renovação (path: `/api/auth`)
- **httpOnly**: `true` para segurança
- **Secure**: `true` em produção, `false` em desenvolvimento

## 📝 Exemplos de Uso Completo

### 1. Fluxo de Login Completo

```bash
# 1. Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123"}' \
  -c cookies.txt

# 2. Usar cookies para requisições autenticadas
curl -X GET http://localhost:5000/api/users/me \
  -b cookies.txt

# 3. Logout
curl -X POST http://localhost:5000/api/users/logout \
  -b cookies.txt
```

### 2. Criar Transação

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "description": "Compras no supermercado",
    "amount": 150.50,
    "type": "expense",
    "category": "64a1b2c3d4e5f6a7b8c9d0e1",
    "date": "2024-01-15"
  }'
```

### 3. Administração

```bash
# Login como admin
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' \
  -c admin_cookies.txt

# Listar usuários
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=10" \
  -b admin_cookies.txt

# Obter estatísticas
curl -X GET http://localhost:5000/api/admin/stats \
  -b admin_cookies.txt
```

## 🚨 Tratamento de Erros

### Códigos de Status

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Bad Request (dados inválidos)
- **401**: Unauthorized (não autenticado)
- **403**: Forbidden (sem permissão)
- **404**: Not Found (recurso não encontrado)
- **409**: Conflict (conflito de dados)
- **500**: Internal Server Error (erro interno)

### Formato de Erro

```json
{
  "error": "Descrição do erro",
  "details": ["Detalhes adicionais"],
  "code": "ERROR_CODE"
}
```

## 🔧 Desenvolvimento

### Iniciar Servidor

```bash
cd backend
npm run dev
```

### Testar Rotas

```bash
# Teste completo de autenticação
npm run test:complete

# Teste básico de autenticação
npm run test:auth

# Limpeza de tokens
npm run cleanup:tokens
```

### Logs

- **Console**: Logs detalhados de todas as operações
- **Access Logs**: Registro de todas as requisições
- **Error Logs**: Tratamento centralizado de erros

---

## 🎯 Próximos Passos

1. **Implementar rate limiting** por IP/usuário
2. **Adicionar validação de entrada** com Joi ou Yup
3. **Implementar cache** para consultas frequentes
4. **Adicionar métricas** de performance
5. **Implementar webhooks** para notificações
6. **Adicionar documentação** com Swagger/OpenAPI

---

**🎉 Sistema de rotas organizado e documentado com sucesso!**
