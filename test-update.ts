import "dotenv/config";
import { getDb } from "./server/db";
import { utilizadores } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function testarUpdate() {
  const db = await getDb();
  if (!db) {
    console.error("DB não disponível");
    return;
  }
  
  const updateResult = await db.update(utilizadores)
      .set({
          enderecoRua: "Rua Teste Atualizado",
      })
      .where(eq(utilizadores.id, 7));
  
  console.log("Resultado do update:", updateResult);
}

testarUpdate();
