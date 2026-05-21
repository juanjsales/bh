import "dotenv/config";
import { getDb } from "../server/db";
import { utilizadores, produtos, pedidos } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { gt } from "drizzle-orm";

async function popularPedidosParaTodos() {
  const db = await getDb();
  if (!db) {
    console.error("[POPULATE] ERRO: Banco de dados não disponível");
    return;
  }

  console.log("[POPULATE] Iniciando população de pedidos...");

  // 1. Obter todos os utilizadores
  const todosUsuarios = await db.select().from(utilizadores);
  
  // 2. Obter produtos disponíveis
  const todosProdutos = await db.select().from(produtos);

  if (todosProdutos.length === 0) {
      console.error("[POPULATE] ERRO: Nenhum produto encontrado.");
      return;
  }

  for (const usuario of todosUsuarios) {
    console.log(`[POPULATE] Processando pedidos para usuário: ${usuario.email} (ID: ${usuario.id})`);
    
    // Gerar 2 pedidos aleatórios para o usuário
    for (let i = 0; i < 2; i++) {
        const produto = todosProdutos[Math.floor(Math.random() * todosProdutos.length)];
        const pedidoId = uuidv4();
        
        try {
            await db.insert(pedidos).values({
                id: pedidoId,
                utilizadorId: usuario.id,
                produtoId: produto.id,
                tipoCompra: "avulsa",
                statusPagamento: "pago",
                valorTotal: produto.precoAvulso,
                statusEnvio: "entregue"
            });
            console.log(`  -> Pedido ${i+1} criado com produto: ${produto.nome}`);
        } catch (error) {
            console.error(`  -> Erro ao criar pedido para ${usuario.email}:`, error);
        }
    }
  }

  console.log("[POPULATE] Concluído!");
}

popularPedidosParaTodos().catch(console.error);
