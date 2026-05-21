import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Utilizador } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: Utilizador | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: Utilizador | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
    console.log(`[Context] Usuário autenticado: ${user ? user.email : "Nenhum"}`);
  } catch (error) {
    console.error(`[Context] Erro na autenticação:`, error);
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
