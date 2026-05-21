import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { produtosAssinaturasPivot } from "../drizzle/schema";

async function popularPivot() {
  const connectionString = "mysql://root:230496@localhost:3306/box_health_db";
  const pool = createPool(connectionString);
  const db = drizzle(pool);

  // Mapeamento:
  // Produtos:
  // - Box Energia (9433c8ac...)
  // - Box Foco (97c5fa53...)
  // - Box Sono (b6b85336...)
  // Assinaturas:
  // - Mensal (aa87c1a0...)
  // - Anual (e067656f...)

  const dados = [
    // Box Energia
    { produtoId: "9433c8ac-c0c6-4aab-9dc3-0fa4c07f5f41", assinaturaId: "aa87c1a0-bc36-4ba4-81d9-00fdf3597cae", precoEspecifico: "89.90" },
    { produtoId: "9433c8ac-c0c6-4aab-9dc3-0fa4c07f5f41", assinaturaId: "e067656f-0a49-4a6f-9af8-ce906e10aa49", precoEspecifico: "800.00" },
    // Box Foco
    { produtoId: "97c5fa53-1326-4302-ae91-2b92f28f40c5", assinaturaId: "aa87c1a0-bc36-4ba4-81d9-00fdf3597cae", precoEspecifico: "89.90" },
    { produtoId: "97c5fa53-1326-4302-ae91-2b92f28f40c5", assinaturaId: "e067656f-0a49-4a6f-9af8-ce906e10aa49", precoEspecifico: "800.00" },
    // Box Sono
    { produtoId: "b6b85336-f6c9-44e0-8c9b-d83c15272a91", assinaturaId: "aa87c1a0-bc36-4ba4-81d9-00fdf3597cae", precoEspecifico: "89.90" },
    { produtoId: "b6b85336-f6c9-44e0-8c9b-d83c15272a91", assinaturaId: "e067656f-0a49-4a6f-9af8-ce906e10aa49", precoEspecifico: "800.00" },
  ];

  await db.insert(produtosAssinaturasPivot).values(dados);
  console.log("Tabela produtos_assinaturas_pivot populada com sucesso!");
  
  await pool.end();
}

popularPivot().catch(console.error);
