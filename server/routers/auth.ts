import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { loginLocal, registerLocal } from "../services/authService";
import { sdk } from "../_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  loginLocal: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Auth] Tentativa de login local para: ${input.email}`);
      const usuario = await loginLocal(input.email, input.senha);
      
      const tokenOpenId = usuario.openId || String(usuario.id);
      console.log(`[Auth] Usuário encontrado: ${usuario.email}, ID: ${usuario.id}, OpenID: ${usuario.openId}, tokenOpenId: ${tokenOpenId}`);

      // DEBUG: Forçando o uso de um token no formato que o verifySession espera
      // A estrutura esperada pelo verifySession é: { openId, appId, name }
      const sessionName = usuario.nomeCompleto || usuario.email || "Usuário";
      const appId = process.env.VITE_APP_ID || "box-health-app";
      const sessionToken = await sdk.createSessionToken(tokenOpenId, {
        name: sessionName,
      });

      console.log(`[Auth] Token criado com:`, { openId: tokenOpenId, appId: appId, name: sessionName });
      console.log(`[Auth] Token gerado manualmente para openId: ${tokenOpenId}. Token: ${sessionToken}`);
      
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 604800000 });

      return { success: true, user: usuario };
    }),

  registerLocal: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      await registerLocal(input.email, input.senha, input.nome_completo);
      return { success: true, message: "Conta criada com sucesso" };
    }),
});
