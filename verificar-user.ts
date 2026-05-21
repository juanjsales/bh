import "dotenv/config";
import { getDb } from "./server/db";
import { utilizadores } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function verificarUsuario() {
  const db = await getDb();
  if (!db) {
    console.error("DB não disponível");
    return;
  }
  
  const user = await db.select().from(utilizadores).where(eq(utilizadores.id, 7)).limit(1);
  console.log("Usuário após atualização do quiz:", JSON.stringify(user, null, 2));
}

verificarUsuario();
