import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { perfisQuiz, pedidos, assinaturas, produtos, carrinho, utilizadores, produtosAssinaturas, produtosAssinaturasPivot } from "../drizzle/schema";
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
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) return null;

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userDetails = await db.select().from(utilizadores).where(eq(utilizadores.id, ctx.user.id)).limit(1);

      return userDetails.length > 0 ? userDetails[0] : null;
    }),
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
        console.log("[DEBUG] Usuario retornado pelo loginLocal:", JSON.stringify(usuario, null, 2));
        const identifier = usuario.openId ?? `${usuario.id}`;
        const sessionToken = await sdk.createSessionToken(identifier, { name: usuario.nome_completo || usuario.email || "Usuário" });
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
    atualizarPerfil: protectedProcedure
      .input(
        z.object({
          nome_completo: z.string().optional(),
          telefone: z.string().optional(),
          enderecoCep: z.string().optional(),
          enderecoRua: z.string().optional(),
          enderecoNumero: z.string().optional(),
          enderecoComplemento: z.string().optional(),
          enderecoBairro: z.string().optional(),
          enderecoCidade: z.string().optional(),
          enderecoEstado: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new Error("Unauthorized");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, any> = {};
        if (input.nome_completo !== undefined) updateData.nomeCompleto = input.nome_completo;
        if (input.telefone !== undefined) updateData.telefone = input.telefone;
        if (input.enderecoCep !== undefined) updateData.enderecoCep = input.enderecoCep;
        if (input.enderecoRua !== undefined) updateData.enderecoRua = input.enderecoRua;
        if (input.enderecoNumero !== undefined) updateData.enderecoNumero = input.enderecoNumero;
        if (input.enderecoComplemento !== undefined) updateData.enderecoComplemento = input.enderecoComplemento;
        if (input.enderecoBairro !== undefined) updateData.enderecoBairro = input.enderecoBairro;
        if (input.enderecoCidade !== undefined) updateData.enderecoCidade = input.enderecoCidade;
        if (input.enderecoEstado !== undefined) updateData.enderecoEstado = input.enderecoEstado;

        await db
          .update(utilizadores)
          .set(updateData)
          .where(eq(utilizadores.id, ctx.user.id));

        return { success: true };
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
          cliente_logradouro: z.string().optional(),
          cliente_numero: z.string().optional(),
          cliente_complemento: z.string().optional(),
          cliente_bairro: z.string().optional(),
          cliente_cidade: z.string().optional(),
          cliente_estado: z.string().optional(),
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
          console.log("[DEBUG] Usuario criado/retornado no Quiz:", JSON.stringify(usuario, null, 2));
          const identifier = usuario.openId ?? `${usuario.id}`;
          const sessionToken = await sdk.createSessionToken(identifier, { name: usuario.nome_completo || usuario.email || "Usuário" });
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
          input.cliente_cep,
          input.cliente_logradouro,
          input.cliente_numero,
          input.cliente_complemento,
          input.cliente_bairro,
          input.cliente_cidade,
          input.cliente_estado
        );
        
        return { id: perfilId, success: true };
      }),

    obterPerfil: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const perfil = await db
        .select()
        .from(perfisQuiz)
        .where(eq(perfisQuiz.utilizadorId, ctx.user.id))
        .orderBy(perfisQuiz.criadoEm)
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
        .from(produtos);
      
      const prodsWithAssinaturas = await Promise.all(prods.map(async (prod) => {
        const assinaturasDoProduto = await db
          .select({
            assinaturaId: produtosAssinaturasPivot.assinaturaId,
            precoEspecifico: produtosAssinaturasPivot.precoEspecifico,
            nomeAssinatura: produtosAssinaturas.nome,
            duracaoMeses: produtosAssinaturas.duracaoMeses
          })
          .from(produtosAssinaturasPivot)
          .innerJoin(produtosAssinaturas, eq(produtosAssinaturas.id, produtosAssinaturasPivot.assinaturaId))
          .where(eq(produtosAssinaturasPivot.produtoId, prod.id));
        
        return { ...prod, assinaturas: assinaturasDoProduto };
      }));
      
      return prodsWithAssinaturas;
    }),

    listarAssinaturas: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const assinaturasList = await db.select().from(produtosAssinaturas);
      return assinaturasList;
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
          precos_assinatura_especificos: z.array(z.object({
            assinaturaId: z.string(),
            precoEspecifico: z.number(),
          })).optional(),
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
          precoAvulso: input.preco_avulso.toString(),
          precoAssinatura: input.preco_assinatura?.toString(),
          categoria: input.categoria,
          imagemUrl: input.imagem_url,
        } as any);

        if (input.precos_assinatura_especificos && input.precos_assinatura_especificos.length > 0) {
          for (const p of input.precos_assinatura_especificos) {
            await db.insert(produtosAssinaturasPivot).values({
              produtoId: prodId,
              assinaturaId: p.assinaturaId,
              precoEspecifico: p.precoEspecifico.toString(),
            });
          }
        }
        
        return { id: prodId, success: true };
      }),

    atualizar: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          nome: z.string().optional(),
          descricao: z.string().optional(),
          preco_avulso: z.number().optional(),
          preco_assinatura: z.number().optional(),
          categoria: z.string().optional(),
          imagem_url: z.string().optional(),
          precos_assinatura_especificos: z.array(z.object({
            assinaturaId: z.string(),
            precoEspecifico: z.number(),
          })).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {};
        if (input.nome !== undefined) updateData.nome = input.nome;
        if (input.descricao !== undefined) updateData.descricao = input.descricao;
        if (input.preco_avulso !== undefined) updateData.precoAvulso = input.preco_avulso.toString();
        if (input.preco_assinatura !== undefined) updateData.precoAssinatura = input.preco_assinatura.toString();
        if (input.categoria !== undefined) updateData.categoria = input.categoria;
        if (input.imagem_url !== undefined) updateData.imagemUrl = input.imagem_url;
        
        await db
          .update(produtos)
          .set(updateData)
          .where(eq(produtos.id, input.id));

        if (input.precos_assinatura_especificos !== undefined) {
          // Remover os antigos e inserir os novos
          await db.delete(produtosAssinaturasPivot).where(eq(produtosAssinaturasPivot.produtoId, input.id));
          
          if (input.precos_assinatura_especificos.length > 0) {
            for (const p of input.precos_assinatura_especificos) {
              await db.insert(produtosAssinaturasPivot).values({
                produtoId: input.id,
                assinaturaId: p.assinaturaId,
                precoEspecifico: p.precoEspecifico.toString(),
              });
            }
          }
        }
        
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

  // Utilizadores routes
  utilizadores: router({
    listar: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(utilizadores);
    }),

    atualizarRole: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          role: z.enum(['cliente', 'admin']),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(utilizadores)
          .set({ role: input.role })
          .where(eq(utilizadores.id, input.id));
        
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
          utilizadorId: ctx.user.id,
          produtoId: input.produto_id,
          tipoCompra: input.tipo_compra,
          valorTotal: input.valor_total.toString(),
          freteValor: input.frete_valor?.toString(),
          enderecoRua: input.endereco?.rua,
          enderecoNumero: input.endereco?.numero,
          enderecoComplemento: input.endereco?.complemento,
          enderecoBairro: input.endereco?.bairro,
          enderecoCidade: input.endereco?.cidade,
          enderecoEstado: input.endereco?.estado,
          enderecoCep: input.endereco?.cep,
          statusPagamento: "pendente",
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
        .select({
          id: pedidos.id,
          utilizadorId: pedidos.utilizadorId,
          produtoId: pedidos.produtoId,
          produtoNome: produtos.nome,
          produtoImagem: produtos.imagemUrl,
          produtoDescricao: produtos.descricao,
          produtoCategoria: produtos.categoria,
          tipoCompra: pedidos.tipoCompra,
          statusPagamento: pedidos.statusPagamento,
          statusEnvio: pedidos.statusEnvio,
          codigoRastreio: pedidos.codigoRastreio,
          valorTotal: pedidos.valorTotal,
          criadoEm: pedidos.criadoEm,
          atualizadoEm: pedidos.atualizadoEm,
          freteValor: pedidos.freteValor,
          enderecoRua: pedidos.enderecoRua,
          enderecoNumero: pedidos.enderecoNumero,
          enderecoComplemento: pedidos.enderecoComplemento,
          enderecoBairro: pedidos.enderecoBairro,
          enderecoCidade: pedidos.enderecoCidade,
          enderecoEstado: pedidos.enderecoEstado,
          enderecoCep: pedidos.enderecoCep,
        })
        .from(pedidos)
        .leftJoin(produtos, eq(pedidos.produtoId, produtos.id))
        .where(eq(pedidos.utilizadorId, ctx.user.id));
      
      return meusPedidos;
    }),

    obterTodos: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const todosPedidos = await db.select().from(pedidos);
      
      return todosPedidos;
    }),

    atualizarStatusPagamento: protectedProcedure
      .input(
        z.object({
          pedido_id: z.string(),
          status: z.enum(["pendente", "pago", "cancelado", "processando"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(pedidos)
          .set({ statusPagamento: input.status })
          .where(eq(pedidos.id, input.pedido_id));
        
        return { success: true };
      }),

    atualizarStatusEnvio: protectedProcedure
      .input(
        z.object({
          pedido_id: z.string(),
          status: z.enum(["preparando", "enviado", "entregue"]),
          codigo_rastreio: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = { statusEnvio: input.status };
        if (input.codigo_rastreio) updateData.codigoRastreio = input.codigo_rastreio;
        
        await db
          .update(pedidos)
          .set(updateData)
          .where(eq(pedidos.id, input.pedido_id));
        
        return { success: true };
      }),

    atualizarStatus: protectedProcedure
      .input(
        z.object({
          pedido_id: z.string(),
          novo_status: z.enum(["pendente", "pago", "cancelado", "processando"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verifica se o pedido pertence ao usuário
        const pedido = await db.select().from(pedidos).where(and(eq(pedidos.id, input.pedido_id), eq(pedidos.utilizadorId, ctx.user!.id))).limit(1);
        if (pedido.length === 0) throw new Error("Acesso negado");
        
        await db
          .update(pedidos)
          .set({ statusPagamento: input.novo_status as any })
          .where(eq(pedidos.id, input.pedido_id));

        if (input.novo_status === "pago") {
          await notificarPagamentoConfirmado(input.pedido_id);
        }
        
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
          utilizadorId: ctx.user.id,
          produtoId: input.produto_id,
          pedidoOrigemId: input.pedido_origem_id,
          proximaCobranca: input.proxima_cobranca,
        } as any);
        
        return { id: assinaturaId, success: true };
      }),

    obterMinhas: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const minhasAssinaturas = await db
        .select({
          id: assinaturas.id,
          utilizadorId: assinaturas.utilizadorId,
          produtoId: assinaturas.produtoId,
          pedidoOrigemId: assinaturas.pedidoOrigemId,
          status: assinaturas.status,
          proximaCobranca: assinaturas.proximaCobranca,
          criadaEm: assinaturas.criadaEm,
          produtoNome: produtos.nome,
        })
        .from(assinaturas)
        .leftJoin(produtos, eq(assinaturas.produtoId, produtos.id))
        .where(eq(assinaturas.utilizadorId, ctx.user.id));
      
      return minhasAssinaturas;
    }),

    obterTodos: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const todasAssinaturas = await db
        .select({
          id: assinaturas.id,
          utilizadorId: assinaturas.utilizadorId,
          produtoId: assinaturas.produtoId,
          pedidoOrigemId: assinaturas.pedidoOrigemId,
          status: assinaturas.status,
          proximaCobranca: assinaturas.proximaCobranca,
          criadaEm: assinaturas.criadaEm,
          clienteNome: utilizadores.nomeCompleto,
          produtoNome: produtos.nome,
        })
        .from(assinaturas)
        .leftJoin(utilizadores, eq(assinaturas.utilizadorId, utilizadores.id))
        .leftJoin(produtos, eq(assinaturas.produtoId, produtos.id));
      
      return todasAssinaturas;
    }),

    pausar: protectedProcedure
      .input(z.object({ assinatura_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(assinaturas)
          .set({ status: "pausada" })
          .where(eq(assinaturas.id, input.assinatura_id));
        
        return { success: true };
      }),

    cancelar: protectedProcedure
      .input(z.object({ assinatura_id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(assinaturas)
          .set({ status: "cancelada" })
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
          assinatura_id: z.string().optional(),
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
              eq(carrinho.utilizadorId, ctx.user.id),
              eq(carrinho.produtoId, input.produto_id),
              eq(carrinho.tipoCompra, input.tipo_compra)
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
          utilizadorId: ctx.user.id,
          produtoId: input.produto_id,
          quantidade: input.quantidade,
          tipoCompra: input.tipo_compra,
          // Se precisar salvar o assinatura_id no carrinho, adicione a coluna no schema e aqui
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
        .where(eq(carrinho.utilizadorId, ctx.user.id));
      
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
          .where(and(eq(carrinho.id, input.item_id), eq(carrinho.utilizadorId, ctx.user.id)))
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
      
      await db.delete(carrinho).where(eq(carrinho.utilizadorId, ctx.user.id));
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
