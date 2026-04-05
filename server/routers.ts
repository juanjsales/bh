import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { perfis_quiz, pedidos, assinaturas, produtos, carrinho, utilizadores } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notificarNovoPedido, notificarPagamentoConfirmado } from "./notificacoes";
import { loginLocal, registerLocal } from "./services/authService";
import { salvarPerfilQuiz } from "./services/quizService";
import { pixRouter } from "./routers/pix";
import { reviewService } from "./services/reviewService";
import { emailService } from "./services/emailService";
import { whatsappService } from "./services/whatsappService";
import { shippingRouter } from "./routers/shipping";


export const appRouter = router({
  system: systemRouter,
  pix: pixRouter,
  shipping: shippingRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    loginLocal: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const usuario = await loginLocal(input.email, input.senha);
        const identifier = usuario.openId ?? `${usuario.id}`;
        const sessionToken = await sdk.createSessionToken(identifier, { name: usuario.nome_completo || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 604800000 });
        return { success: true, user: usuario };
      }),
    registerLocal: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
          nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        })
      )
      .mutation(async ({ input }) => {
        await registerLocal(input.email, input.senha, input.nome_completo);
        return { success: true, message: "Conta criada com sucesso" };
      }),
  }),

  // Quiz routes
  quiz: router({
    salvarRespostas: publicProcedure
      .input(
        z.object({
          respostas_brutas: z.record(z.string(), z.any()),
          respostas_pessoais: z.record(z.string(), z.any()).optional(),
          respostas_emocionais: z.record(z.string(), z.any()).optional(),
          categoria_calculada: z.string(),
          cliente_nome: z.string().optional(),
          cliente_email: z.string().optional(),
          cliente_whatsapp: z.string().optional(),
          cliente_cep: z.string().optional(),
          // Dados de registro (opcionais, apenas se usuário não logado)
          registro: z.object({
            email: z.string().email(),
            senha: z.string().min(6),
            nome_completo: z.string().min(3),
          }).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        let userId = ctx.user?.id;
        
        // Se não estiver logado, registrar
        if (!userId) {
          if (!input.registro) {
            throw new Error("Usuário não autenticado e dados de registro não fornecidos");
          }
          
          const usuarioExistente = await db.select().from(utilizadores).where(eq(utilizadores.email, input.registro.email)).limit(1);
          if (usuarioExistente.length > 0) {
            throw new Error("Já existe uma conta com este email. Por favor, faça login ou utilize outro email.");
          }

          const { userId: novoUserId } = await registerLocal(
            input.registro.email,
            input.registro.senha,
            input.registro.nome_completo
          );
          userId = novoUserId;
          
          // Criar sessão automaticamente
          const usuario = await loginLocal(input.registro.email, input.registro.senha);
          const identifier = usuario.openId ?? `${usuario.id}`;
          const sessionToken = await sdk.createSessionToken(identifier, { name: usuario.nome_completo || "" });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 604800000 });
        }
        
        const perfilId = await salvarPerfilQuiz(
          userId,
          input.respostas_brutas,
          input.categoria_calculada,
          input.respostas_pessoais,
          input.respostas_emocionais,
          input.cliente_nome,
          input.cliente_email,
          input.cliente_whatsapp,
          input.cliente_cep
        );
        
        return { id: perfilId, success: true };
      }),

    obterPerfil: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const perfil = await db
        .select()
        .from(perfis_quiz)
        .where(eq(perfis_quiz.utilizador_id, ctx.user.id))
        .orderBy((t) => t.criado_em)
        .limit(1);
      
      return perfil.length > 0 ? perfil[0] : null;
    }),
  }),

  // Produtos routes
  produtos: router({
    listar: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const prods = await db
        .select()
        .from(produtos)
        .where(eq(produtos.ativo, true));
      
      return prods;
    }),

    obter: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const prod = await db
          .select()
          .from(produtos)
          .where(eq(produtos.id, input.id))
          .limit(1);
        
        return prod.length > 0 ? prod[0] : null;
      }),

    criar: protectedProcedure
      .input(
        z.object({
          nome: z.string(),
          descricao: z.string().optional(),
          preco_avulso: z.number(),
          preco_assinatura: z.number().optional(),
          categoria: z.string().optional(),
          imagem_url: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const prodId = uuidv4();
        
        await db.insert(produtos).values({
          id: prodId,
          nome: input.nome,
          descricao: input.descricao,
          preco_avulso: input.preco_avulso.toString(),
          preco_assinatura: input.preco_assinatura?.toString(),
          categoria: input.categoria,
          imagem_url: input.imagem_url,
        } as any);
        
        return { id: prodId, success: true };
      }),

    atualizar: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          nome: z.string(),
          descricao: z.string().optional(),
          preco_avulso: z.number(),
          preco_assinatura: z.number().optional(),
          categoria: z.string().optional(),
          imagem_url: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        await db.update(produtos)
          .set({
            nome: data.nome,
            descricao: data.descricao,
            preco_avulso: data.preco_avulso.toString(),
            preco_assinatura: data.preco_assinatura?.toString(),
            categoria: data.categoria,
            imagem_url: data.imagem_url,
          } as any)
          .where(eq(produtos.id, id));
        
        return { success: true };
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(produtos).where(eq(produtos.id, input.id));
        
        return { success: true };
      }),
  }),

  // Pedidos routes
  pedidos: router({
    criar: protectedProcedure
      .input(
        z.object({
          produto_id: z.string(),
          tipo_compra: z.enum(["avulsa", "assinatura"]),
          valor_total: z.number(),
          frete_valor: z.number().optional(),
          endereco: z.object({
            rua: z.string(),
            numero: z.string(),
            complemento: z.string().optional(),
            bairro: z.string(),
            cidade: z.string(),
            estado: z.string().max(2),
            cep: z.string().max(10),
          }).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const pedidoId = uuidv4();
        
        await db.insert(pedidos).values({
          id: pedidoId,
          utilizador_id: ctx.user.id,
          produto_id: input.produto_id,
          tipo_compra: input.tipo_compra,
          valor_total: input.valor_total.toString(),
          frete_valor: input.frete_valor?.toString(),
          endereco_rua: input.endereco?.rua,
          endereco_numero: input.endereco?.numero,
          endereco_complemento: input.endereco?.complemento,
          endereco_bairro: input.endereco?.bairro,
          endereco_cidade: input.endereco?.cidade,
          endereco_estado: input.endereco?.estado,
          endereco_cep: input.endereco?.cep,
          status_pagamento: "pendente",
        } as any);
        
        // Buscar dados do produto para notificação
        const produto = await db.select().from(produtos).where(eq(produtos.id, input.produto_id)).limit(1);
        
        // Notificar proprietário
        if (produto.length > 0) {
          await notificarNovoPedido(
            pedidoId,
            ctx.user.nome_completo || ctx.user.email || "Cliente",
            input.valor_total.toString(),
            produto[0].nome
          );
        }
        
        return { id: pedidoId, success: true };
      }),

    obterMeus: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const meusPedidos = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.utilizador_id, ctx.user.id));
      
      return meusPedidos;
    }),

    obterTodos: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const todosPedidos = await db.select().from(pedidos);
      
      return todosPedidos;
    }),

    atualizarStatus: protectedProcedure
      .input(
        z.object({
          pedido_id: z.string(),
          status_pagamento: z.enum(["pendente", "pago", "cancelado"]).optional(),
          status_envio: z.enum(["preparando", "enviado", "entregue"]).optional(),
          codigo_rastreio: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {};
        
        if (input.status_pagamento) updateData.status_pagamento = input.status_pagamento;
        if (input.status_envio) updateData.status_envio = input.status_envio;
        if (input.codigo_rastreio) updateData.codigo_rastreio = input.codigo_rastreio;
        
        await db
          .update(pedidos)
          .set(updateData)
          .where(eq(pedidos.id, input.pedido_id));
        
        return { success: true };
      }),
  }),

  // Assinaturas routes
  assinaturas: router({
    criar: protectedProcedure
      .input(
        z.object({
          produto_id: z.string(),
          pedido_origem_id: z.string(),
          proxima_cobranca: z.date(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const assinaturaId = uuidv4();
        
        await db.insert(assinaturas).values({
          id: assinaturaId,
          utilizador_id: ctx.user.id,
          produto_id: input.produto_id,
          pedido_origem_id: input.pedido_origem_id,
          proxima_cobranca: input.proxima_cobranca,
        } as any);
        
        return { id: assinaturaId, success: true };
      }),

    obterMinhas: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const minhasAssinaturas = await db
        .select()
        .from(assinaturas)
        .where(eq(assinaturas.utilizador_id, ctx.user.id));
      
      return minhasAssinaturas;
    }),

    atualizarStatus: protectedProcedure
      .input(
        z.object({
          assinatura_id: z.string(),
          status: z.enum(["ativa", "pausada", "cancelada"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verificar se a assinatura pertence ao usuário
        const assinatura = await db
          .select()
          .from(assinaturas)
          .where(eq(assinaturas.id, input.assinatura_id))
          .limit(1);
        
        if (assinatura.length === 0 || assinatura[0].utilizador_id !== ctx.user.id) {
          throw new Error("Forbidden");
        }
        
        await db
          .update(assinaturas)
          .set({ status: input.status })
          .where(eq(assinaturas.id, input.assinatura_id));
        
        return { success: true };
      }),
  }),

  // Reviews routes
  reviews: router({
    criar: protectedProcedure
      .input(
        z.object({
          produto_id: z.string(),
          rating: z.number().min(1).max(5),
          comentario: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const review = await reviewService.criarReview(
          ctx.user.id,
          input.produto_id,
          input.rating,
          input.comentario
        );
        
        return { success: true, review };
      }),

    obterProduto: publicProcedure
      .input(z.object({ produto_id: z.string() }))
      .query(async ({ input }) => {
        const reviews = await reviewService.obterReviewsProduto(input.produto_id);
        const stats = await reviewService.obterEstatisticasProduto(input.produto_id);
        return { reviews, stats };
      }),

    obterPendentes: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
      return await reviewService.obterReviewsPendentes();
    }),

    moderar: protectedProcedure
      .input(
        z.object({
          review_id: z.string(),
          aprovado: z.boolean(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await reviewService.moderarReview(input.review_id, input.aprovado);
      }),

    deletar: protectedProcedure
      .input(z.object({ review_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await reviewService.deletarReview(
          input.review_id,
          ctx.user.id,
          ctx.user.role === "admin"
        );
      }),
  }),

  // Email routes
  email: router({
    enviarConfirmacao: protectedProcedure
      .input(z.object({ pedido_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await emailService.enviarConfirmacaoPedido(input.pedido_id);
      }),

    enviarStatus: protectedProcedure
      .input(
        z.object({
          pedido_id: z.string(),
          status: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await emailService.enviarStatusEntrega(input.pedido_id, input.status);
      }),

    enviarRecomendacao: protectedProcedure
      .input(
        z.object({
          utilizador_id: z.number(),
          produto_id: z.string(),
          categoria: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await emailService.enviarRecomendacao(
          input.utilizador_id,
          input.produto_id,
          input.categoria
        );
      }),

    obterHistorico: protectedProcedure
      .input(z.object({ utilizador_id: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await emailService.obterHistoricoEmails(input.utilizador_id);
      }),

    obterEstatisticas: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
      return await emailService.obterEstatisticasEmails();
    }),
  }),

  // WhatsApp routes
  whatsapp: router({
    enviarPagamentoPendente: protectedProcedure
      .input(z.object({ pedido_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await whatsappService.enviarPagamentoPendente(input.pedido_id);
      }),

    enviarPagamentoConfirmado: protectedProcedure
      .input(z.object({ pedido_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await whatsappService.enviarPagamentoConfirmado(input.pedido_id);
      }),

    enviarAtualizacaoEntrega: protectedProcedure
      .input(
        z.object({
          pedido_id: z.string(),
          status: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await whatsappService.enviarAtualizacaoEntrega(input.pedido_id, input.status);
      }),

    obterHistorico: protectedProcedure
      .input(z.object({ utilizador_id: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
        return await whatsappService.obterHistoricoWhatsapp(input.utilizador_id);
      }),

    obterEstatisticas: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");
      return await whatsappService.obterEstatisticasWhatsapp();
    }),
  }),

  // Carrinho routes
  carrinho: router({
    adicionar: protectedProcedure
      .input(
        z.object({
          produto_id: z.string(),
          quantidade: z.number().default(1),
          tipo_compra: z.enum(["avulsa", "assinatura"]).default("avulsa"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const itemId = uuidv4();

        // Verificar se já existe o mesmo produto com o mesmo tipo de compra no carrinho
        const itemExistente = await db
          .select()
          .from(carrinho)
          .where(
            and(
              eq(carrinho.utilizador_id, ctx.user.id),
              eq(carrinho.produto_id, input.produto_id),
              eq(carrinho.tipo_compra, input.tipo_compra)
            )
          )
          .limit(1);

        if (itemExistente.length > 0) {
          await db
            .update(carrinho)
            .set({
              quantidade: itemExistente[0].quantidade + input.quantidade,
            })
            .where(eq(carrinho.id, itemExistente[0].id));
          return { id: itemExistente[0].id, success: true };
        }
        
        await db.insert(carrinho).values({
          id: itemId,
          utilizador_id: ctx.user.id,
          produto_id: input.produto_id,
          quantidade: input.quantidade,
          tipo_compra: input.tipo_compra,
        } as any);
        
        return { id: itemId, success: true };
      }),

    obter: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const itens = await db
        .select()
        .from(carrinho)
        .where(eq(carrinho.utilizador_id, ctx.user.id));
      
      return itens;
    }),

    remover: protectedProcedure
      .input(z.object({ item_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verificar se o item pertence ao usuário
        const item = await db
          .select()
          .from(carrinho)
          .where(and(eq(carrinho.id, input.item_id), eq(carrinho.utilizador_id, ctx.user.id)))
          .limit(1);
        
        if (item.length === 0) {
          throw new Error("Item não encontrado ou acesso negado");
        }
        
        await db.delete(carrinho).where(eq(carrinho.id, input.item_id));
        return { success: true };
      }),

    limpar: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(carrinho).where(eq(carrinho.utilizador_id, ctx.user.id));
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
