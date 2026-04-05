import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUtilizador, utilizadores } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: any = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      console.log("[Database] Tentando conectar ao URL:", ENV.databaseUrl);
      const pool = mysql.createPool(ENV.databaseUrl);
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
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["nome_completo", "email"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.updatedAt = new Date();
    }

    await db.insert(utilizadores).values(values).onDuplicateKeyUpdate({
      set: updateSet,
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
