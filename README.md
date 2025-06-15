# Fabi Finanças

Aplicativo de gestão financeira pessoal, construído com Next.js e Node.js.

---

## Descrição
O Fabi Finanças é uma plataforma para controle de receitas, despesas, relatórios e visualização de dados financeiros, com foco em experiência moderna, responsiva e personalizável.

---

## Roadmap do Projeto

### 1. Estabilização e Correção de Bugs
- Corrigir loops infinitos e alto uso de GPU no dashboard.
- Garantir fluxo de login fluido (sem múltiplos cliques).
- Ajustar detalhes de UI (avatar duplicado, barra de rolagem, notificações visuais).

### 2. Novas Funcionalidades e Páginas
- **Página Nova Transação**
  - Modernizar interface (ícones, seletor de data com Calendar/Popover).
- **Página Transações**
  - Refatorar para tabela profissional com @tanstack/react-table.
  - Criar componente DataTable e arquivo columns.tsx.
- **Página Relatórios**
  - Criar gráficos dinâmicos (pizza e barras) com recharts.
  - Filtros por tipo, categoria e período.
  - Novo endpoint backend para categorias e atualização do endpoint de transações.
- **Dashboard Interativo**
  - Replicar filtros de período do relatório no dashboard.
  - Cards de resumo financeiro dinâmicos.
- **Página de Perfil do Usuário**
  - Estruturar com abas (Perfil e Configurações).
  - Backend e frontend para:
    - Atualizar nome e e-mail.
    - Alterar senha (com verificação).
    - Upload de foto de perfil (multer).
- **Rodapé**
  - Adicionar menção "VieiraDev" ao layout principal.

### 3. Configuração e Temas
- Garantir que alterações de cor sejam feitas apenas via `globals.css`.
- Evitar alterações desnecessárias em arquivos de configuração (tailwind, postcss).

---

## Observações Importantes
- Sempre que precisar consultar os próximos passos, utilize este README.
- Se novas funcionalidades ou correções forem implementadas, atualize este roadmap.
- Em caso de problemas com temas/cores, priorize ajustes no `globals.css`.

---

**Última atualização:** _Atualize esta data sempre que o roadmap for alterado._

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Roadmap Detalhado (Próximos Passos)

Esta seção consolida todas as funcionalidades e melhorias planejadas para o projeto, com base no histórico de desenvolvimento.

### Parte 1: Melhorias de Experiência do Usuário (UX) - Concluído ✅
- **Sistema de Notificações Toast:**
  - [x] Instalado e configurado `react-hot-toast`.
  - [x] Criado hook `useToast`.
  - [x] Feedback visual para login, ações e navegação.
- **Loading States Melhorados:**
  - [x] Componente `LoadingSpinner` reutilizável.
  - [x] `Skeleton loading` implementado no dashboard e outras áreas.
- **Responsividade e CSS:**
  - [x] Classes CSS para responsividade adicionadas.
  - [x] Efeitos de hover e transições suaves.
- **Página de Login Atualizada:**
  - [x] Logo do Google colorido.
  - [x] Imagem de fundo `login-background.png` configurada.
  - [x] Animação do personagem "Fabi" removida.

### Parte 2: Funcionalidades Financeiras Essenciais (Concluído ✅)
- **Sistema de Categorias Personalizadas:**
  - [x] Permitir que o usuário crie, edite e exclua suas próprias categorias de transação.
- **Sistema de Orçamento Mensal:**
  - [x] Alertas visuais automáticos (80% e 100% do orçamento)
  - [x] Integração com personagem Fabi
  - [x] Definir orçamentos por categoria
  - [x] Interface para gerenciar orçamentos
  - [x] Backend para orçamentos personalizados
- **Exportação de Dados:**
  - [x] Exportar relatórios e transações para formatos como PDF ou CSV/Excel.

### Parte 3: Conteúdo e Engajamento (Em Progresso 🔄)
- **Sistema de Metas/Objetivos Financeiros:**
  - [x] Página dedicada para criar e acompanhar metas (ex: economizar para uma viagem, comprar um carro).
  - [x] Tracking de progresso com barras e gráficos.
- **Sistema de Gamificação:**
  - [ ] Conquistas e "badges" por metas atingidas (ex: "Mestre da Economia").
  - [ ] Sistema de pontos por hábitos financeiros positivos.
  - [ ] Desafios financeiros mensais.

### Parte 4: Funcionalidades Avançadas (A Fazer 🎯)
- **Painel de Administração:**
  - [ ] Área para upload de vídeos de mentoria.
  - [ ] Gestão de usuários e permissões.
  - [ ] Controle de conteúdo (publicar/despublicar vídeos, etc.).
- **Sistema de Pagamento (Planos e Assinaturas):**
  - [ ] Integração com gateway de pagamento (Stripe, PagSeguro, etc.).
  - [ ] Página de checkout para planos de mentoria.
  - [ ] Gestão de assinaturas dos usuários.
- **Integração com APIs Externas:**
  - [ ] Open Banking para sincronização de contas.
  - [ ] Cotações de moedas e investimentos em tempo real.

### Parte 5: Melhorias Técnicas (A Fazer 🎯)
- **Testes Automatizados:**
  - [ ] Implementar testes unitários e de integração (Jest, React Testing Library).
  - [ ] Configurar testes end-to-end (Cypress).
- **Otimização de Performance:**
  - [ ] Análise de performance (Lighthouse).
  - [ ] Implementar Progressive Web App (PWA) para funcionalidade offline.
  - [ ] Sistema de cache para dados frequentemente acessados.
- **Analytics:**
  - [ ] Tracking de uso de funcionalidades para entender o comportamento do usuário.
  - [ ] Métricas de engajamento.
