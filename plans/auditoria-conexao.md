# Auditoria de Estrutura e Autenticação

## Descobertas

1.  **Configuração de API (tRPC):** A configuração está correta. O cliente utiliza `trpc.ts` para definir o router e o servidor expõe o middleware em `/api/trpc`.
2.  **Autenticação:** O fluxo de autenticação redireciona para uma URL definida em `VITE_OAUTH_PORTAL_URL`. No `.env`, esta variável está configurada para `http://localhost:3000`. Isso significa que, se o servidor local estiver rodando, ele é o próprio provedor de OAuth.
3.  **Possíveis falhas:** 
    *   Verificar se o servidor de OAuth (neste caso, o próprio servidor local na porta 3000) está configurado para lidar com as rotas de `app-auth`.
    *   Possível problema de CORS ou Cookies com `SameSite=None` se o domínio for alterado.

## Plano de Correção

1.  **Validar o servidor de OAuth:** Verificar `server/_core/oauth.ts` para garantir que as rotas de callback estão operacionais.
2.  **Ajuste de Variáveis de Ambiente:** Garantir que o `.env` esteja apontando corretamente para o servidor, especialmente em ambientes de produção.
3.  **Logs de Debug:** Adicionar logs detalhados em `client/src/_core/hooks/useAuth.ts` para rastrear o redirecionamento em tempo real.
