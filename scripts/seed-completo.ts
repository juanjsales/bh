import "dotenv/config";
import { getDb } from "../server/db";
import {
  utilizadores,
  produtos,
  assinaturas,
  pedidos,
  reviews,
  emailLogs,
  pagamentosPix,
  whatsappLogs,
  perfisQuiz,
  carrinho,
  produtosAssinaturas,
  produtosAssinaturasPivot,
} from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { format } from "date-fns";
import { eq } from "drizzle-orm";

async function seedCompleto() {
  const db = await getDb();
  if (!db) {
    console.error("❌ [SEED] Banco de dados não disponível");
    process.exit(1);
  }

  console.log("🌱 [SEED] Iniciando população completa do banco...\n");

  try {
    // 1. USUÁRIOS
    console.log("👥 Criando usuários...");
    const senhaHash = await bcrypt.hash("123456", 10);
    const usuariosData = [
      { nome: "Juan Sales", email: "juan@exemplo.com" },
      { nome: "Maria Silva", email: "maria@exemplo.com" },
      { nome: "Admin User", email: "admin@exemplo.com" },
    ];

    const userIds: number[] = [];
    for (const u of usuariosData) {
      // Verifica se existe usando a sintaxe correta do Drizzle
      const existing = await db.select().from(utilizadores).where(eq(utilizadores.email, u.email)).limit(1);
      
      if (existing.length > 0) {
        console.log(`  ! Usuário já existe: ${u.email}`);
        userIds.push(existing.id);
      } else {
        await db.insert(utilizadores).values({
          nomeCompleto: u.nome,
          email: u.email,
          senhaHash,
          role: u.email.includes("admin") ? "admin" : "cliente",
          enderecoEstado: "SP",
        });
        const novo = await db.select().from(utilizadores).where(eq(utilizadores.email, u.email)).limit(1);
        userIds.push(novo.id);
        console.log(`  ✓ Usuário criado: ${u.email}`);
      }
    }

    // 2. PRODUTOS E TIPOS DE ASSINATURA
    console.log("\n📦 Criando produtos e planos...");
    const produtoIds: string[] = [];
    const prods = ["Box Sono", "Box Energia", "Box Foco"];
    
    for (const nome of prods) {
      const id = uuidv4();
      await db.insert(produtos).values({
        id,
        nome,
        precoAvulso: "99.90",
        ativo: 1,
        categoria: "Saúde"
      });
      produtoIds.push(id);
    }

    const planos = [
      { nome: "Mensal", meses: 1, preco: "89.90" },
      { nome: "Anual", meses: 12, preco: "800.00" }
    ];
    const planoIds: string[] = [];
    for (const p of planos) {
      const id = uuidv4();
      await db.insert(produtosAssinaturas).values({
        id,
        nome: p.nome,
        duracaoMeses: p.meses,
        preco: p.preco,
        ativo: 1
      });
      planoIds.push(id);
    }

    // 3. PERFIL QUIZ
    console.log("\n🎯 Criando perfis de quiz...");
    for (let i = 0; i < 2; i++) {
      await db.insert(perfisQuiz).values({
        id: uuidv4(),
        utilizadorId: userIds[i],
        respostasBrutas: { meta: "dormir_melhor" },
        categoriaCalculada: "Sono Profundo",
        clienteNome: usuariosData[i].nome
      });
    }

    // 4. PEDIDOS E PAGAMENTOS
    console.log("\n📋 Criando pedidos e Pix...");
    const pedidoId = uuidv4();
    await db.insert(pedidos).values({
      id: pedidoId,
      utilizadorId: userIds,
      produtoId: produtoIds,
      tipoCompra: "avulsa",
      valorTotal: "99.90",
      statusPagamento: "pago",
      statusEnvio: "entregue"
    });

    await db.insert(pagamentosPix).values({
      id: uuidv4(),
      pedidoId,
      utilizadorId: userIds,
      valor: "99.90",
      chavePix: "pix@empresa.com",
      status: "confirmado"
    });

    // 5. ASSINATURAS ATIVAS
    console.log("\n🔄 Criando assinaturas...");
    await db.insert(assinaturas).values({
      id: uuidv4(),
      utilizadorId: userIds,
      produtoId: produtoIds,
      pedidoOrigemId: pedidoId,
      status: "ativa",
      proximaCobranca: format(new Date(), "yyyy-MM-dd HH:mm:ss")
    });

    // 6. LOGS (Email e WhatsApp)
    console.log("\n📧 Gerando logs...");
    await db.insert(emailLogs).values({
      id: uuidv4(),
      utilizadorId: userIds,
      tipo: "confirmacao_pedido",
      destinatario: "juan@exemplo.com",
      assunto: "Pedido Confirmado",
      status: "enviado"
    });

    await db.insert(whatsappLogs).values({
      id: uuidv4(),
      utilizadorId: userIds,
      telefone: "5511999999999",
      tipo: "pagamento_confirmado",
      mensagem: "Seu Pix foi recebido!",
      status: "enviado"
    });

    console.log("\n✅ [SEED] Finalizado com sucesso!");
    process.exit(0);

  } catch (error) {
    console.error("❌ [SEED] Erro:", error);
    process.exit(1);
  }
}

seedCompleto();