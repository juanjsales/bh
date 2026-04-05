# Plano de Correção da Autenticação

O sistema apresenta atualmente uma divergência entre a criação de sessões via OAuth (`server/_core/oauth.ts` usando `sdk.createSessionToken`) e a criação via Login Local (`server/routers/auth.ts` usando uma serialização manual em base64 no cookie).

Isso causa o erro "[Auth] Missing session cookie" visto no terminal, pois o `sdk.verifySession` espera uma estrutura JWT compatível com `server/_core/session.ts` (ou a lógica do SDK), que não está sendo respeitada pelo login local.

## Passos para Resolução

1.  **Refatorar `server/routers/auth.ts`**:
    *   Substituir a criação manual de cookies (Base64) pela função `createSessionToken` de `server/_core/session.ts`.
    *   Garantir que o `COOKIE_NAME` seja definido corretamente nas opções de cookie.

2.  **Validar a verificação de sessão**:
    *   Confirmar se `server/_core/session.ts` (usando `jose`) é a fonte da verdade para verificação de tokens.
    *   Verificar se o SDK (`server/_core/sdk.ts`) precisa ser ajustado para usar `server/_core/session.ts` em vez de sua própria lógica interna.

3.  **Implementação**:
    *   Trocar `ctx.res.setHeader` manual por chamadas padrão `res.cookie` seguindo o padrão de `server/_core/oauth.ts`.
