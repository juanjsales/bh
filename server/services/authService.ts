import bcrypt from "bcryptjs";
import { getDb } from "../db.ts";
import { utilizadores } from "../../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Hash seguro de senha usando bcryptjs
 */
export async function hashSenha(senha: string): Promise<string> {
  return await bcrypt.hash(senha, 10);
}

export async function loginLocal(email: string, senha: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const user = await db
    .select()
    .from(utilizadores)
    .where(eq(utilizadores.email, email))
    .limit(1);

  if (user.length === 0) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
  }

  const usuario = user[0];
  if (!usuario.senhaHash) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
  }

  return usuario;
}

export async function registerLocal(email: string, senha: string, nome_completo: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  // Verificar se email já existe
  const existing = await db
    .select()
    .from(utilizadores)
    .where(eq(utilizadores.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new TRPCError({ code: "CONFLICT", message: "Email já registrado" });
  }

  // Hash da senha
  const senhaHash = await hashSenha(senha);

  // Criar usuário
  let result;
  try {
    result = await db.insert(utilizadores).values({
      email,
      nomeCompleto: nome_completo,
      senhaHash: senhaHash,
      role: "cliente",
    });
  } catch (error) {
    console.error("Erro ao inserir novo usuário no banco de dados:", error);
    throw new TRPCError({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Erro ao salvar usuário no banco de dados" 
    });
  }

  // @ts-ignore
  const userId = result[0].insertId;
  return { success: true, userId };
}
