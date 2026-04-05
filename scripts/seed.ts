import "dotenv/config";
import { getDb } from "../server/db";
import { utilizadores, produtos, assinaturas, pedidos, reviews } from "../drizzle/schema";
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

  // Criar Usuário
  const senhaHash = await bcrypt.hash("123456", 10);
  let userId: number;
  try {
    console.log("Inserindo usuário...");
    await db.insert(utilizadores).values({
      nome_completo: "Juan Sales",
      email: "juan@exemplo.com",
      senha_hash: senhaHash,
      role: "cliente",
    });
    const result = await db.select().from(utilizadores).where(eq(utilizadores.email, "juan@exemplo.com")).limit(1);
    userId = result[0].id;
    console.log("Usuário inserido com ID:", userId);
  } catch (error) {
    console.error("Erro ao inserir usuário:", error);
    return;
  }

  // Criar Produtos
  const produtosExemplo = [
    {
      id: uuidv4(),
      nome: "Box Relaxamento Total",
      descricao: "Uma seleção de itens para desestressar após um longo dia.",
      preco_avulso: "149.90",
      categoria: "Relaxamento",
    },
    {
      id: uuidv4(),
      nome: "Box Foco e Produtividade",
      descricao: "Essenciais para aumentar sua concentração.",
      preco_avulso: "129.90",
      categoria: "Foco",
    },
    {
      id: uuidv4(),
      nome: "Box Energia Renovada",
      descricao: "Produtos para dar um boost na sua disposição.",
      preco_avulso: "139.90",
      categoria: "Energia",
    },
    {
      id: uuidv4(),
      nome: "Box Sono Profundo",
      descricao: "Itens selecionados para melhorar a qualidade do seu sono.",
      preco_avulso: "159.90",
      categoria: "Sono",
    },
  ];

  for (const p of produtosExemplo) {
    try {
      console.log(`[SEED] Tentando inserir produto: ${p.nome}`);
      await db.insert(produtos).values(p);
      console.log(`[SEED] Produto inserido com sucesso: ${p.nome}`);
    } catch (error) {
      console.error(`[SEED] ERRO ao inserir produto: ${p.nome}`, error);
    }
  }

  // Criar Pedidos e Reviews para os produtos
  for (const p of produtosExemplo) {
    const pedidoId = uuidv4();
    try {
      console.log(`[SEED] Tentando inserir pedido para: ${p.nome}`);
      await db.insert(pedidos).values({
        id: pedidoId,
        utilizador_id: userId,
        produto_id: p.id,
        tipo_compra: "avulsa",
        status_pagamento: "pago",
        valor_total: p.preco_avulso,
      });
      console.log(`[SEED] Pedido inserido com sucesso: ${pedidoId}`);
      
      console.log(`[SEED] Tentando inserir review para: ${p.nome}`);
      await db.insert(reviews).values({
        id: uuidv4(),
        utilizador_id: userId,
        produto_id: p.id,
        pedido_id: pedidoId,
        rating: 5,
        comentario: "Excelente produto, recomendo muito!",
      });
      console.log(`[SEED] Review inserido com sucesso para produto: ${p.nome}`);
    } catch (error) {
      console.error(`[SEED] ERRO ao inserir pedido/review para: ${p.nome}`, error);
    }
  }

  console.log("Seed concluído!");
}

seed().catch(console.error);
