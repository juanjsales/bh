# 📦 Box & Health - Plataforma de Curadoria de Bem-estar

Uma plataforma moderna de e-commerce especializada em caixas de bem-estar personalizadas, com quiz emocional inteligente, checkout PIX e gestão de assinaturas.

## 🎯 Visão Geral

**Box & Health** oferece uma experiência completa de descoberta e compra de caixas de bem-estar:

1. **Landing Page** - Apresentação das caixas e CTA para quiz
2. **Quiz Emocional** - 5 etapas para descobrir a caixa ideal
3. **Recomendação Inteligente** - Algoritmo que categoriza usuários
4. **Paywall** - Detalhes do produto e opções de compra
5. **Checkout PIX** - Geração de QR code e instruções
6. **Dashboard do Cliente** - Histórico de pedidos e assinaturas
7. **Backoffice Admin** - Gestão de produtos e pedidos

## 🏗️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend** | Express 4, tRPC 11, Node.js |
| **Banco de Dados** | MySQL, Drizzle ORM |
| **Autenticação** | Manus OAuth |
| **Estado** | Zustand, React Query |
| **Testes** | Vitest |
| **Deployment** | Manus Platform |

## 📋 Pré-requisitos

- Node.js 22.13.0+
- pnpm 10.4.1+
- Conta Manus (para OAuth e deployment)

## 🚀 Setup Local

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd box-health
pnpm install
```

### 2. Variáveis de Ambiente

Criar arquivo `.env.local`:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/box_health

# Manus OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# JWT
JWT_SECRET=seu_jwt_secret_aleatorio

# Notificações
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
```

### 3. Migrations do Banco

```bash
# Gerar migrations
pnpm drizzle-kit generate

# Aplicar migrations (via UI Manus)
# Ou executar SQL manualmente
```

### 4. Iniciar Desenvolvimento

```bash
# Terminal 1: Backend
pnpm dev

# Terminal 2: Frontend (se separado)
cd client
pnpm dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura de Pastas

```
box-health/
├── client/
│   ├── src/
│   │   ├── pages/          # Páginas principais
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── stores/         # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários
│   │   └── App.tsx         # Router principal
│   └── index.html
├── server/
│   ├── routers/            # tRPC routers (refatorado)
│   ├── services/           # Lógica de negócio
│   ├── _core/              # Framework core
│   ├── db.ts               # Database helpers
│   └── notificacoes.ts     # Notificações
├── drizzle/
│   ├── schema.ts           # Definição de tabelas
│   └── migrations/         # SQL migrations
├── shared/                 # Código compartilhado
└── package.json
```

## 🗄️ Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `utilizadores` | Usuários da plataforma |
| `perfis_quiz` | Respostas e categorias do quiz |
| `produtos` | Catálogo de caixas |
| `pedidos` | Transações de compra |
| `assinaturas` | Planos de recorrência |
| `carrinho` | Itens do carrinho |

### Índices

```sql
-- Índices para performance
CREATE INDEX idx_pedidos_user ON pedidos(utilizador_id);
CREATE INDEX idx_pedidos_status ON pedidos(status_pagamento);
CREATE INDEX idx_assinaturas_user ON assinaturas(utilizador_id);
CREATE INDEX idx_quiz_user ON perfis_quiz(utilizador_id);
```

## 🔐 Segurança

### Autenticação
- OAuth via Manus (seguro, sem gerenciar senhas)
- Session cookies com CSRF protection
- JWT para API calls

### Autorização
- Role-based access control (admin/user)
- RLS policies no banco de dados
- Validação de entrada com Zod

### Boas Práticas
- Sem exposição de stack traces
- Rate limiting em endpoints críticos
- Sanitização de entrada
- HTTPS em produção

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Modo watch
pnpm test --watch

# Com cobertura
pnpm test --coverage
```

### Cobertura Atual
- **19 testes** passando
- **Cobertura**: ~30% (em melhoria)
- **Áreas**: Auth, Quiz, Admin, Dashboard

### Adicionar Novos Testes

```typescript
// server/features.test.ts
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Feature", () => {
  it("should do something", async () => {
    // Teste aqui
  });
});
```

## 🚢 Deployment

### Deploy no Manus

```bash
# 1. Criar checkpoint
pnpm webdev save-checkpoint

# 2. Clicar em "Publish" na UI Manus

# 3. Configurar domínio customizado (opcional)
```

### Variáveis de Produção

Configurar via UI Manus:
- `DATABASE_URL` - URL do banco em produção
- `JWT_SECRET` - Secret aleatório forte
- Outras conforme necessário

## 📊 API tRPC

### Routers Disponíveis

```typescript
// Autenticação
trpc.auth.me.useQuery()
trpc.auth.logout.useMutation()

// Quiz
trpc.quiz.salvarRespostas.useMutation()
trpc.quiz.obterPerfil.useQuery()

// Produtos
trpc.produtos.listar.useQuery()
trpc.produtos.obter.useQuery({ id: "..." })

// Pedidos
trpc.pedidos.criar.useMutation()
trpc.pedidos.obterMeus.useQuery()
trpc.pedidos.atualizarStatus.useMutation()

// Assinaturas
trpc.assinaturas.criar.useMutation()
trpc.assinaturas.obterMinhas.useQuery()
```

## 🎨 Design System

### Paleta de Cores (Kraft)

```css
--background: #f5f1ed    /* Bege claro */
--foreground: #2d2416    /* Marrom escuro */
--accent: #b8860b        /* Ouro */
--muted: #e8ddd5         /* Bege muted */
```

### Tipografia

- **Headings**: Lora (serif)
- **Body**: Inter (sans-serif)

## 🐛 Troubleshooting

### Erro: "Database not available"
- Verificar `DATABASE_URL` em `.env.local`
- Confirmar que migrations foram aplicadas
- Testar conexão: `pnpm drizzle-kit studio`

### Erro: "Unauthorized"
- Verificar se usuário está autenticado
- Limpar cookies do navegador
- Fazer login novamente

### Erro: "Forbidden"
- Verificar se usuário é admin (para rotas admin)
- Contatar proprietário para promoção de role

## 📚 Documentação Adicional

- [REVIEW.md](./REVIEW.md) - Análise completa de código
- [todo.md](./todo.md) - Roadmap de features
- [Drizzle Docs](https://orm.drizzle.team)
- [tRPC Docs](https://trpc.io)

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Criar Pull Request

### Padrões de Código

- TypeScript strict mode
- Prettier para formatação
- ESLint para linting
- Testes para features críticas

## 📞 Suporte

- **Issues**: GitHub Issues
- **Email**: support@boxhealth.com
- **Chat**: Discord community

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para bem-estar personalizado**

Última atualização: 01/04/2026
