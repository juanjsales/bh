# Revisão Inicial do Projeto

Resumo das descobertas iniciais (mapeamento rápido):

- Arquitetura:
  - Monorepo simples com `client/` e `server/` sob a pasta raiz.
  - Cliente React + tRPC + wouter (routes gerenciadas em `client/src/App.tsx`).
  - Servidor Express + tRPC expõe `appRouter` em `server/routers.ts` (arquivo grande com muitos sub-routers).

- Principais pontos detectados:
  - `server/routers.ts` é um grande arquivo central (300+ linhas). Já existem alguns routers em `server/routers/*.ts` (pix, shipping, auth). Recomenda-se dividir `routers.ts` em módulos por domínio (quiz, produtos, pedidos, assinaturas, reviews, whatsapp, email, carrinho).
  - Uso extensivo de `any` e casts (`as any`) em serviços e updates (ex.: `emailService`, `whatsappService`, `orderService`, `reviewService`) — dificulta manutenção e segurança de tipos.
  - Muitos `console.log` espalhados (server e scripts). Recomenda-se centralizar logger e usar níveis (info/warn/error) e evitar logs sensíveis.
  - Várias rotas/procedures usam `protectedProcedure` e checam `ctx.user` — padrão correto, mas erros são lançados com `throw new Error(...)` (sem tipos de erro ou tratamento unificado). Melhorar middleware de erros e usar classes de erro ou `TRPCError` para respostas consistentes.
  - Testes com `vitest` existentes em `server/*.test.ts` — falha ao executar localmente provavelmente porque o terminal estava fora do diretório do repositório; CI adicionado para execução em GitHub Actions.
  - Configuração: adicionei Prettier e ESLint, e um workflow CI para validar build/test/lint.

- Segurança e produção:
  - Sessões manipuladas via cookie (`COOKIE_NAME`) com criação de token via `sdk.createSessionToken` — verifique armazenamento seguro de segredos e duração de cookie.
  - Algumas funções de envio (email/whatsapp) são stubs com `console.log` e `TODO` para integrar providers reais.

Prioridades recomendadas (curto prazo, médio impacto):

1. Corrigir o fluxo de execução local dos testes (rodar `pnpm install` no root `bh/`, depois `pnpm test`).
2. Criar um `logger` central (ex.: `server/_core/logger.ts`) e substituir `console.log` críticos no servidor.
3. Dividir `server/routers.ts` em módulos por domínio e expor `appRouter` combinando-os.
4. Substituir `throw new Error(...)` por `TRPCError` onde aplicável e adicionar um middleware de tratamento de erros padronizado.
5. Remover/limitar `any` em serviços críticos (`authService`, `orderService`, `emailService`, `whatsappService`, `reviewService`) — criar tipos para retornos de DB e inputs.
6. Cobertura de testes: adicionar testes de integração para rotas tRPC críticas (auth, pedidos, produtos) com banco em memória ou fixtures.

Proposta de próximo passo imediato (posso executar):

- Gerar relatório mais detalhado e automatizar pequenas correções iniciais:
  1. Criar `server/_core/logger.ts` simples e substituir `console.log` em `server/_core/index.ts` e em `server/db.ts`.
  2. Adicionar middleware de erro tRPC no `server/_core/trpc.ts` para mapear exceções a `TRPCError`.
  3. Executar `pnpm install` e `pnpm test` no diretório do projeto para ver falhas de testes existentes.

Perguntas rápidas para priorização:

- Deseja que eu aplique as correções automáticas iniciais (logger + small trpc error middleware + rodar testes)?
- Prefere que eu crie PRs separados por domínio (routers, types, logger, testes) ou aplicar diretamente na branch atual?

Vou aguardar sua confirmação para executar as correções iniciais.
