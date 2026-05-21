import "dotenv/config";
import { getDb } from "./server/db";
import { perfisQuiz } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function verificarPerfil() {
  const db = await getDb();
  if (!db) {
    console.error("DB não disponível");
    return;
  }
  
  const perfis = await db.select().from(perfisQuiz).where(eq(perfisQuiz.utilizadorId, 7));
  console.log("Perfis do usuário:", JSON.stringify(perfis, null, 2));
}

verificarPerfil();
