# Configuração de Variáveis de Ambiente - Frontend

## Arquivo `.env.local`

Crie um arquivo `.env.local` na pasta `frontend/` com as seguintes variáveis:

```bash
# Configurações do Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Configurações do Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Configurações de ambiente
NODE_ENV=development
```

## Variáveis Explicadas

### `NEXT_PUBLIC_API_URL`
- URL base da API backend
- Em desenvolvimento: `http://localhost:5000`
- Em produção: URL do seu servidor (ex: `https://api.seudominio.com`)

### `NEXTAUTH_URL`
- URL base do frontend
- Em desenvolvimento: `http://localhost:3000`
- Em produção: URL do seu frontend (ex: `https://seudominio.com`)

### `NEXTAUTH_SECRET`
- Chave secreta para o NextAuth.js
- Gere uma chave forte usando: `openssl rand -base64 32`
- **IMPORTANTE**: Nunca compartilhe ou commite esta chave

### `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- Credenciais do Google OAuth (opcional)
- Necessárias apenas se você quiser usar login com Google
- Configure no Google Cloud Console

### `NODE_ENV`
- Ambiente de execução
- `development` para desenvolvimento local
- `production` para produção

## Configuração para Produção

Para produção, ajuste as URLs para seus domínios reais:

```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXTAUTH_URL=https://seudominio.com
NODE_ENV=production
```

## Segurança

- **NUNCA** commite o arquivo `.env.local`
- Mantenha as chaves secretas seguras
- Use variáveis de ambiente diferentes para cada ambiente
- Em produção, configure as variáveis no seu provedor de hospedagem
