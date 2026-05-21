import { eq } from "drizzle-orm";
<<<<<<< HEAD
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { utilizadores } from "../drizzle/schema.ts";
type InsertUtilizador = typeof utilizadores.$inferInsert;
import { ENV } from './_core/env.ts';
=======
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUtilizador, utilizadores } from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from './_core/logger';
>>>>>>> 82612e53bcbfafd5b4fe94ca20da03c919582ea1

let _db: any = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
<<<<<<< HEAD
      console.log("[Database] Tentando conectar ao URL:", ENV.databaseUrl);
      const pool = createPool(ENV.databaseUrl);
=======
      logger.info("[Database] Tentando conectar ao URL:", ENV.databaseUrl);
      const pool = new Pool({ connectionString: ENV.databaseUrl });
>>>>>>> 82612e53bcbfafd5b4fe94ca20da03c919582ea1
      _db = drizzle(pool);
      
      logger.info("[Database] Conexão estabelecida com sucesso!");
    } catch (error) {
<<<<<<< HEAD
      console.error("[Database] Falha ao conectar:", error);
      console.error("[Database] Detalhes do erro:", JSON.stringify(error));
=======
      logger.error("[Database] Falha ao conectar:", error);
>>>>>>> 82612e53bcbfafd5b4fe94ca20da03c919582ea1
      _db = null;
    }
  }
  return _db;
}

export async function upsertUtilizador(user: InsertUtilizador): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
    if (!db) {
    logger.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUtilizador = {
      openId: user.openId,
      nomeCompleto: user.nomeCompleto ?? null,
      email: user.email ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'cliente'),
      telefone: user.telefone ?? null,
      enderecoRua: user.enderecoRua ?? null,
      enderecoNumero: user.enderecoNumero ?? null,
      enderecoComplemento: user.enderecoComplemento ?? null,
      enderecoBairro: user.enderecoBairro ?? null,
      enderecoCidade: user.enderecoCidade ?? null,
      enderecoEstado: user.enderecoEstado ?? null,
      enderecoCep: user.enderecoCep ?? null,
      senhaHash: user.senhaHash ?? undefined,
    };

    await db.insert(utilizadores).values(values).onDuplicateKeyUpdate({
      set: {
        nomeCompleto: values.nomeCompleto,
        email: values.email,
        role: values.role,
        telefone: values.telefone,
        enderecoRua: values.enderecoRua,
        enderecoNumero: values.enderecoNumero,
        enderecoComplemento: values.enderecoComplemento,
        enderecoBairro: values.enderecoBairro,
        enderecoCidade: values.enderecoCidade,
        enderecoEstado: values.enderecoEstado,
        enderecoCep: values.enderecoCep,
        senhaHash: values.senhaHash,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUtilizadorById(id: number) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(utilizadores).where(eq(utilizadores.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUtilizadorByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(utilizadores).where(eq(utilizadores.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}
