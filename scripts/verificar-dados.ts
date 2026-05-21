import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { produtos, produtosAssinaturas } from "../drizzle/schema";

async function listarDados() {
  const connectionString = "mysql://root:230496@localhost:3306/box_health_db";
  const pool = createPool(connectionString);
  const db = drizzle(pool);
  
  const listaProdutos = await db.select().from(produtos);
  const listaAssinaturas = await db.select().from(produtosAssinaturas);
  
  console.log("--- PRODUTOS ---");
  console.log(JSON.stringify(listaProdutos, null, 2));
  console.log("--- ASSINATURAS ---");
  console.log(JSON.stringify(listaAssinaturas, null, 2));
  
  await pool.end();
}

listarDados().catch(console.error);
