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
} from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

async function seedCompleto() {
  const db = await getDb();
  if (!db) {
    console.error("❌ [SEED] Banco de dados não disponível");
    process.exit(1);
  }

  console.log("🌱 [SEED] Iniciando população completa do banco...\n");

  try {
    // ============================================
    // 1. USUÁRIOS
    // ============================================
    console.log("👥 Criando usuários...");
    const senhaHash = await bcrypt.hash("123456", 10);
    
    const usuariosData = [
      {
        nomeCompleto: "Juan Sales",
        email: "juan@exemplo.com",
        senhaHash,
        telefone: "11987654321",
        enderecoCompleto: "Rua Das Flores, 123, São Paulo, SP",
      },
      {
        nomeCompleto: "Maria Silva",
        email: "maria@exemplo.com",
        senhaHash,
        telefone: "11987654322",
        enderecoCompleto: "Av. Paulista, 500, São Paulo, SP",
      },
      {
        nomeCompleto: "Admin User",
        email: "admin@exemplo.com",
        senhaHash,
        telefone: "11987654323",
        enderecoCompleto: "Rua Admin, 1, São Paulo, SP",
      },
    ];

    const userIds: number[] = [];
    for (const userData of usuariosData) {
      await db.insert(utilizadores).values({
        nomeCompleto: userData.nomeCompleto,
        email: userData.email,
        senhaHash: userData.senhaHash,
        telefone: userData.telefone,
        enderecoCompleto: userData.enderecoCompleto,
        role: userData.email === "admin@exemplo.com" ? "admin" : "cliente",
      });
      
      const result = await db
        .select()
        .from(utilizadores)
        .where((t) => t.email === userData.email)
        .limit(1);
      
      if (result.length > 0) {
        userIds.push(result[0].id);
        console.log(`  ✓ Usuário criado: ${userData.email}`);
      }
    }

    // ============================================
    // 2. PRODUTOS
    // ============================================
    console.log("\n📦 Criando produtos...");
    const produtosData = [
      {
        nome: "Box Sono Profundo",
        descricao:
          "Ritual de sono com lavanda, camomila e ingredientes naturais para noites tranquilas.",
        categoria: "Sono",
        precoAvulso: "89.90",
        precoAssinatura: "76.41",
      },
      {
        nome: "Box Energia Vital",
        descricao: "Chá verde, gengibre e ervas tonificantes para aumentar disposição e foco.",
        categoria: "Energia",
        precoAvulso: "79.90",
        precoAssinatura: "67.91",
      },
      {
        nome: "Box Calma Mental",
        descricao: "Sálvia, eucalipto e pedras de meditação para reduzir estresse.",
        categoria: "Calma",
        precoAvulso: "84.90",
        precoAssinatura: "72.16",
      },
      {
        nome: "Box Beleza Natural",
        descricao: "Óleos naturais, pétalas de rosa e mel para cuidado de pele.",
        categoria: "Beleza",
        precoAvulso: "99.90",
        precoAssinatura: "84.91",
      },
      {
        nome: "Box Equilíbrio Corpo",
        descricao: "Cúrcuma, gengibre e adaptógenos para bem-estar holístico.",
        categoria: "Equilíbrio",
        precoAvulso: "94.90",
        precoAssinatura: "80.66",
      },
    ];

    const produtoIds: string[] = [];
    for (const prodData of produtosData) {
      const prodId = uuidv4();
      await db.insert(produtos).values({
        id: prodId,
        nome: prodData.nome,
        descricao: prodData.descricao,
        categoria: prodData.categoria,
        precoAvulso: prodData.precoAvulso,
        precoAssinatura: prodData.precoAssinatura,
        ativo: true,
      });
      produtoIds.push(prodId);
      console.log(`  ✓ Produto criado: ${prodData.nome}`);
    }

    // ============================================
    // 3. PERFIS DE QUIZ
    // ============================================
    console.log("\n🎯 Criando perfis de quiz...");
    const quizProfiles = [
      {
        utilizadorId: userIds[0],
        categoria: "sono",
        nome: "Juan Sales",
        email: "juan@exemplo.com",
      },
      {
        utilizadorId: userIds[1],
        categoria: "energia",
        nome: "Maria Silva",
        email: "maria@exemplo.com",
      },
    ];

    for (const quiz of quizProfiles) {
      const quizId = uuidv4();
      await db.insert(perfisQuiz).values({
        id: quizId,
        utilizadorId: quiz.utilizadorId,
        respostasBrutas: JSON.stringify({ test: "data" }),
        categoriaCalculada: quiz.categoria,
        clienteNome: quiz.nome,
        clienteEmail: quiz.email,
      });
      console.log(`  ✓ Perfil quiz criado para: ${quiz.nome}`);
    }

    // ============================================
    // 4. PEDIDOS
    // ============================================
    console.log("\n📋 Criando pedidos...");
    const pedidosData = [
      {
        utilizadorId: userIds[0],
        produtoId: produtoIds[0],
        valor: "89.90",
        status_pagamento: "pago" as const,
        status_envio: "entregue" as const,
      },
      {
        utilizadorId: userIds[0],
        produtoId: produtoIds[1],
        valor: "79.90",
        status_pagamento: "pendente" as const,
        status_envio: "preparando" as const,
      },
      {
        utilizadorId: userIds[1],
        produtoId: produtoIds[2],
        valor: "84.90",
        status_pagamento: "pago" as const,
        status_envio: "enviado" as const,
      },
    ];

    const pedidoIds: string[] = [];
    for (const pedData of pedidosData) {
      const pedidoId = uuidv4();
      await db.insert(pedidos).values({
        id: pedidoId,
        utilizadorId: pedData.utilizadorId,
        produtoId: pedData.produtoId,
        tipoCompra: "avulsa",
        valorTotal: pedData.valor,
        statusPagamento: pedData.status_pagamento,
        statusEnvio: pedData.status_envio,
        codigoRastreio: `BR${Math.random().toString(36).substring(7).toUpperCase()}`,
        enderecoRua: "Rua Das Flores",
        enderecoNumero: "123",
        enderecoBairro: "Vila Mariana",
        enderecoCidade: "São Paulo",
        enderecoEstado: "SP",
        enderecoCep: "01310100",
      });
      pedidoIds.push(pedidoId);
      console.log(`  ✓ Pedido criado: ${pedidoId.substring(0, 8)}...`);
    }

    // ============================================
    // 5. ASSINATURAS
    // ============================================
    console.log("\n🔄 Criando assinaturas...");
    const assinaturasData = [
      {
        utilizadorId: userIds[0],
        produtoId: produtoIds[0],
        pedidoOrigemId: pedidoIds[0],
      },
      {
        utilizadorId: userIds[1],
        produtoId: produtoIds[2],
        pedidoOrigemId: pedidoIds[2],
      },
    ];

    for (const assinData of assinaturasData) {
      const assId = uuidv4();
      const proximaCobranca = new Date();
      proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);

      await db.insert(assinaturas).values({
        id: assId,
        utilizadorId: assinData.utilizadorId,
        produtoId: assinData.produtoId,
        pedidoOrigemId: assinData.pedidoOrigemId,
        proximaCobranca: proximaCobranca.toISOString(),
        status: "ativa",
      });
      console.log(`  ✓ Assinatura criada para usuário ID: ${assinData.utilizadorId}`);
    }

    // ============================================
    // 6. REVIEWS
    // ============================================
    console.log("\n⭐ Criando reviews...");
    const reviewsData = [
      {
        utilizadorId: userIds[0],
        produtoId: produtoIds[0],
        pedidoId: pedidoIds[0],
        rating: 5,
        comentario: "Excelente produto! Dormi muito bem.",
      },
      {
        utilizadorId: userIds[1],
        produtoId: produtoIds[2],
        pedidoId: pedidoIds[2],
        rating: 4,
        comentario: "Bom custo-benefício, muito satisfeito.",
      },
    ];

    for (const revData of reviewsData) {
      const revId = uuidv4();
      await db.insert(reviews).values({
        id: revId,
        utilizadorId: revData.utilizadorId,
        produtoId: revData.produtoId,
        pedidoId: revData.pedidoId,
        rating: revData.rating,
        comentario: revData.comentario,
        moderado: true,
      });
      console.log(`  ✓ Review criada: ${revData.rating} estrelas`);
    }

    // ============================================
    // 7. PAGAMENTOS PIX
    // ============================================
    console.log("\n💳 Criando pagamentos PIX...");
    const pagtoData = [
      {
        pedidoId: pedidoIds[1],
        utilizadorId: userIds[0],
        valor: "79.90",
        status: "pendente" as const,
      },
    ];

    for (const pgData of pagtoData) {
      const pgId = uuidv4();
      const expiraEm = new Date();
      expiraEm.setMinutes(expiraEm.getMinutes() + 30);

      await db.insert(pagamentosPix).values({
        id: pgId,
        pedidoId: pgData.pedidoId,
        utilizadorId: pgData.utilizadorId,
        valor: pgData.valor,
        chavePix: "contato@boxhealth.com.br",
        qrCodeBase64: JSON.stringify({ dummy: "qrcode" }),
        statusPix: pgData.status,
        expiraEm: expiraEm.toISOString(),
      });
      console.log(`  ✓ Pagamento PIX criado: ID ${pgId.substring(0, 8)}...`);
    }

    // ============================================
    // 8. EMAIL LOGS
    // ============================================
    console.log("\n📧 Criando logs de email...");
    const emailData = [
      {
        utilizadorId: userIds[0],
        pedidoId: pedidoIds[0],
        destinatario: "juan@exemplo.com",
        tipoEmail: "confirmacao_pedido" as const,
      },
      {
        utilizadorId: userIds[1],
        pedidoId: pedidoIds[2],
        destinatario: "maria@exemplo.com",
        tipoEmail: "status_entrega" as const,
      },
    ];

    for (const emailDat of emailData) {
      const emailId = uuidv4();
      await db.insert(emailLogs).values({
        id: emailId,
        utilizadorId: emailDat.utilizadorId,
        pedidoId: emailDat.pedidoId,
        tipoEmail: emailDat.tipoEmail,
        destinatario: emailDat.destinatario,
        assunto: `Box Health - ${emailDat.tipoEmail}`,
        statusEmail: "enviado",
      });
      console.log(`  ✓ Email log criado: ${emailDat.tipoEmail}`);
    }

    // ============================================
    // 9. WHATSAPP LOGS
    // ============================================
    console.log("\n💬 Criando logs de WhatsApp...");
    const whatsappData = [
      {
        utilizadorId: userIds[0],
        pedidoId: pedidoIds[0],
        telefone: "5511987654321",
        tipoWhatsapp: "pagamento_confirmado" as const,
      },
      {
        utilizadorId: userIds[1],
        pedidoId: pedidoIds[2],
        telefone: "5511987654322",
        tipoWhatsapp: "entrega" as const,
      },
    ];

    for (const whatsappDat of whatsappData) {
      const whatsappId = uuidv4();
      await db.insert(whatsappLogs).values({
        id: whatsappId,
        utilizadorId: whatsappDat.utilizadorId,
        pedidoId: whatsappDat.pedidoId,
        telefone: whatsappDat.telefone,
        tipoWhatsapp: whatsappDat.tipoWhatsapp,
        mensagem: `Sua ${whatsappDat.tipoWhatsapp} foi confirmada!`,
        statusWhatsapp: "enviado",
      });
      console.log(`  ✓ WhatsApp log criado: ${whatsappDat.tipoWhatsapp}`);
    }

    // ============================================
    // 10. CARRINHO
    // ============================================
    console.log("\n🛒 Criando itens no carrinho...");
    const carrinhoData = [
      {
        utilizadorId: userIds[0],
        produtoId: produtoIds[2],
        quantidade: 2,
      },
      {
        utilizadorId: userIds[1],
        produtoId: produtoIds[3],
        quantidade: 1,
      },
    ];

    for (const carrDat of carrinhoData) {
      const carrId = uuidv4();
      await db.insert(carrinho).values({
        id: carrId,
        utilizadorId: carrDat.utilizadorId,
        produtoId: carrDat.produtoId,
        quantidade: carrDat.quantidade,
        tipoCompra: "avulsa",
      });
      console.log(`  ✓ Item no carrinho: ${carrDat.quantidade} unidade(s)`);
    }

    console.log("\n✅ [SEED] População completa finalizada com sucesso!\n");
    console.log("📊 Resumo:");
    console.log(`  • Usuários criados: ${userIds.length}`);
    console.log(`  • Produtos criados: ${produtoIds.length}`);
    console.log(`  • Pedidos criados: ${pedidoIds.length}`);
    console.log(`  • Assinaturas criadas: 2`);
    console.log(`  • Reviews criadas: 2`);
    console.log(`  • Pagamentos PIX criados: 1`);
    console.log(`  • Emails logados: 2`);
    console.log(`  • WhatsApp logado: 2`);
    console.log(`  • Quiz profiles criados: 2`);
    console.log(`  • Itens no carrinho: 2`);

    process.exit(0);
  } catch (error) {
    console.error("❌ [SEED] Erro durante a população:", error);
    process.exit(1);
  }
}

seedCompleto();
