import "dotenv/config";
import { getDb } from "../server/db";
import { utilizadores, produtos, pedidos, reviews } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("[SEED] ERRO: Banco de dados não disponível");
    return;
  }

  console.log("[SEED] Iniciando seed...");

  // 1. Criar Usuário
  const senhaHash = await bcrypt.hash("123456", 10);
  let userId: number;
  
  try {
    console.log("Inserindo usuário...");
    // Usando ignore para evitar erro se rodar o seed duas vezes (email unique)
    await db.insert(utilizadores).values({
      nomeCompleto: "Juan Sales",
      email: "juan@exemplo.com",
      senhaHash: senhaHash,
      role: "cliente",
      enderecoEstado: "SP",
      enderecoCep: "01234567"
    });
    
    const result = await db.select().from(utilizadores).where(eq(utilizadores.email, "juan@exemplo.com")).limit(1);
    userId = result.id;
    console.log("Usuário inserido/recuperado com ID:", userId);
  } catch (error) {
    console.error("Erro ao inserir usuário:", error);
    return;
  }

  // 2. Criar Produtos (Corrigido para usar os nomes das chaves do seu schema)
  const produtosExemplo = [
    {
      id: uuidv4(),
      nome: "Box Relaxamento Total",
      descricao: "Uma seleção de itens para desestressar após um longo dia.",
      precoAvulso: "149.90", // camelCase conforme seu schema
      categoria: "Relaxamento",
      ativo: 1,
    },
    {
      id: uuidv4(),
      nome: "Box Foco e Produtividade",
      descricao: "Essenciais para aumentar sua concentração.",
      precoAvulso: "129.90",
      categoria: "Foco",
      ativo: 1,
    },
    {
      id: uuidv4(),
      nome: "Box Energia Renovada",
      descricao: "Produtos para dar um boost na sua disposição.",
      precoAvulso: "139.90",
      categoria: "Energia",
      ativo: 1,
    },
    {
      id: uuidv4(),
      nome: "Box Sono Profundo",
      descricao: "Itens selecionados para melhorar a qualidade do seu sono.",
      precoAvulso: "159.90",
      categoria: "Sono",
      ativo: 1,
    },
  ];

  for (const p of produtosExemplo) {
    try {
      await db.insert(produtos).values(p);
      console.log(`[SEED] Produto inserido: ${p.nome}`);
    } catch (error) {
      console.error(`[SEED] ERRO ao inserir produto: ${p.nome}`, error);
    }
  }

  // 3. Criar Pedidos e Reviews (Corrigido para camelCase)
  for (const p of produtosExemplo) {
    const pedidoId = uuidv4();
    try {
      await db.insert(pedidos).values({
        id: pedidoId,
        utilizadorId: userId, // Corrigido de utilizador_id
        produtoId: p.id,      // Corrigido de produto_id
        tipoCompra: "avulsa",
        statusPagamento: "pago",
        valorTotal: p.precoAvulso,
        statusEnvio: "preparando"
      });
      
      await db.insert(reviews).values({
        id: uuidv4(),
        utilizadorId: userId,
        produtoId: p.id,
        pedidoId: pedidoId,
        rating: 5,
        comentario: "Excelente produto, recomendo muito!",
        moderado: 1,
      });
      console.log(`[SEED] Pedido e Review criados para: ${p.nome}`);
    } catch (error) {
      console.error(`[SEED] ERRO ao processar pedido/review para: ${p.nome}`, error);
    }
  }

  console.log("Seed concluído!");
}

seed().catch(console.error);