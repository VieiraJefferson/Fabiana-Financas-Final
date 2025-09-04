# 🚀 Checklist de Produção - Fabiana Finanças

## 📋 Visão Geral

Este checklist garante que todas as configurações de produção estejam corretas para o sistema de autenticação robusto funcionar perfeitamente.

## 🔐 Configurações de Ambiente

### ✅ Backend (.env)

```bash
# Ambiente
NODE_ENV=production

# Banco de dados
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fabiana-financas

# JWT Secrets (GERE CHAVES FORTES!)
JWT_ACCESS_SECRET=sua-chave-access-super-secreta-aqui
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta-aqui

# URLs do Frontend
FRONTEND_URL=https://seudominio.com
ALLOWED_ORIGINS=https://seudominio.com

# Cookies
COOKIE_SECRET=sua-chave-cookie-super-secreta-aqui

# Porta
PORT=5000
```

### ✅ Frontend (.env.local)

```bash
# URLs
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXTAUTH_URL=https://seudominio.com

# Secrets
NEXTAUTH_SECRET=sua-chave-nextauth-super-secreta-aqui

# Google OAuth (se usar)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Ambiente
NODE_ENV=production
```

## 🛡️ Configurações de Segurança

### ✅ Backend (server.js)

```javascript
// CRÍTICO: Trust proxy para Vercel/Render/Nginx
app.set('trust proxy', 1);

// CORS configurado corretamente
app.use(cors({
  origin: ['https://seudominio.com'], // URL EXATA do frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));
```

### ✅ Cookies (tokenManager.js)

```javascript
// Em produção: Secure: true, SameSite: 'None'
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true em produção
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
};
```

## 🔄 Fluxo de Autenticação

### ✅ Fluxo de Boot

1. **App monta** → Hook verifica autenticação
2. **GET /api/users/me** → Se 401, tenta renovar
3. **POST /api/users/refresh** → Renova tokens
4. **GET /api/users/me** → Retry com novos tokens
5. **Se falhar** → Redireciona para login

### ✅ Rotação de Refresh Tokens

- ✅ **JTI único** para cada refresh token
- ✅ **Revogação** do token antigo ao renovar
- ✅ **Banco de dados** para controle de tokens
- ✅ **Limpeza automática** de tokens expirados

### ✅ Logout Completo

- ✅ **Backend**: Revoga refresh token
- ✅ **Cookies**: Limpa access_token e refresh_token
- ✅ **NextAuth**: signOut() para limpar sessão
- ✅ **Redirecionamento**: Para página de login

## 🌐 Configurações de CORS

### ✅ Headers Necessários

```javascript
// Backend
app.use(cors({
  origin: ['https://seudominio.com'], // URL EXATA
  credentials: true, // CRÍTICO para cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// Frontend
axios.defaults.withCredentials = true;
fetch(url, { credentials: 'include' });
```

## 🍪 Configurações de Cookies

### ✅ Segurança

- ✅ **httpOnly: true** → Não acessível via JavaScript
- ✅ **Secure: true** → Apenas HTTPS em produção
- ✅ **SameSite: 'None'** → Para cross-origin em produção
- ✅ **Path: '/'** → Disponível em toda a aplicação
- ✅ **Domain** → Configurado corretamente

### ✅ Nomes dos Cookies

```javascript
// Access Token
res.cookie('access_token', accessToken, cookieOptions);

// Refresh Token  
res.cookie('refresh_token', refreshToken, cookieOptions);
```

## 🔍 Verificações de Produção

### ✅ Health Check

```bash
# Testar se a API está respondendo
curl https://api.seudominio.com/health

# Resposta esperada
{
  "ok": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234.56,
  "environment": "production"
}
```

### ✅ Teste de Autenticação

```bash
# 1. Registrar usuário
curl -X POST https://api.seudominio.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"test@x.com","password":"123456"}' \
  -c cookies.txt

# 2. Acessar perfil (deve funcionar)
curl -X GET https://api.seudominio.com/api/users/me \
  -b cookies.txt

# 3. Fazer logout
curl -X POST https://api.seudominio.com/api/users/logout \
  -b cookies.txt

# 4. Tentar acessar perfil (deve falhar)
curl -X GET https://api.seudominio.com/api/users/me \
  -b cookies.txt
```

## 🧪 Testes de Produção

### ✅ Executar Testes

```bash
# Testes de fumaça
npm run test:smoke

# Testes específicos
npm run test:user
npm run test:admin

# Todos os testes
npm run test:all

# Testes com cobertura
npm run test:coverage
```

## 🎯 Checklist Final

### ✅ Configurações

- [ ] `NODE_ENV=production`
- [ ] `trust proxy` configurado
- [ ] CORS com `credentials: true`
- [ ] Cookies com `Secure: true` e `SameSite: 'None'`
- [ ] URLs configuradas corretamente
- [ ] Secrets gerados e configurados

### ✅ Funcionalidades

- [ ] Registro de usuários funcionando
- [ ] Login funcionando
- [ ] Renovação automática de tokens
- [ ] Logout limpa sessão
- [ ] Proteção de rotas funcionando
- [ ] Admin consegue acessar painel

### ✅ Testes

- [ ] Testes de fumaça passando
- [ ] Health check respondendo
- [ ] CORS configurado corretamente
- [ ] Cookies sendo enviados
- [ ] Fluxo de autenticação completo

---

## 🎉 Sistema Pronto para Produção!

Com todas as verificações acima passando, o sistema de autenticação está **verdadeiramente robusto** e pronto para produção! 🚀
