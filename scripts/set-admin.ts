import { eq } from "drizzle-orm";
import { getDb } from "../server/db.ts";
import { utilizadores } from "../drizzle/schema.ts";

async function setAdmin() {
  try {
    const db = await getDb();
    if (!db) {
        console.error("Não foi possível conectar ao banco de dados");
        return;
    }

    const userId = 9;
    console.log(`Atualizando usuário ${userId} para admin...`);
    
    const result = await db
      .update(utilizadores)
      .set({ role: "admin" })
      .where(eq(utilizadores.id, userId));

    console.log("Resultado da atualização:", result);
  } catch (error) {
    console.error("Erro ao atualizar o usuário:", error);
  } finally {
    process.exit();
  }
}

setAdmin();
