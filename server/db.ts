import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUtilizador, utilizadores } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: any = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      console.log("[Database] Tentando conectar ao URL:", ENV.databaseUrl);
      const pool = new Pool({ connectionString: ENV.databaseUrl });
      _db = drizzle(pool);
      
      console.log("[Database] Conexão estabelecida com sucesso!");
    } catch (error) {
      console.error("[Database] Falha ao conectar:", error);
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
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUtilizador = {
      openId: user.openId,
      nome_completo: user.nome_completo ?? null,
      email: user.email ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'cliente'),
    };

    await db.insert(utilizadores).values(values).onConflictDoUpdate({
      target: utilizadores.openId,
      set: {
        nome_completo: values.nome_completo,
        email: values.email,
        role: values.role,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUtilizadorById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(utilizadores).where(eq(utilizadores.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUtilizadorByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(utilizadores).where(eq(utilizadores.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}
