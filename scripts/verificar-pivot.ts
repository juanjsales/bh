import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { produtosAssinaturasPivot } from "../drizzle/schema";

async function verificarDados() {
  const connectionString = "mysql://root:230496@localhost:3306/box_health_db";
  const pool = createPool(connectionString);
  const db = drizzle(pool);

  const resultados = await db.select().from(produtosAssinaturasPivot);
  
  console.log("--- DADOS NA TABELA PIVOT ---");
  console.log(JSON.stringify(resultados, null, 2));
  
  await pool.end();
}

verificarDados().catch(console.error);
