import { getDb } from "../db";
import { reviews, pedidos, utilizadores, produtos } from "../../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Serviço de Reviews - Gerencia avaliações de produtos
 * Validações:
 * - Usuário só pode avaliar produtos que comprou
 * - Rating deve estar entre 1 e 5
 * - Um usuário só pode deixar um review por produto
 */

export const reviewService = {
  /**
   * Criar novo review
   * Valida se o usuário comprou o produto antes de permitir avaliação
   */
  async criarReview(
    utilizadorId: number,
    produtoId: string,
    rating: number,
    comentario?: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Validar rating
    if (rating < 1 || rating > 5) {
      throw new Error("Rating deve estar entre 1 e 5");
    }

    // Validar se usuário comprou o produto
    const pedidoCompra = await db
      .select()
      .from(pedidos)
      .where(
        and(
          eq(pedidos.utilizador_id, utilizadorId),
          eq(pedidos.produto_id, produtoId),
          eq(pedidos.status_pagamento, "pago")
        )
      )
      .limit(1);

    if (pedidoCompra.length === 0) {
      throw new Error("Você só pode avaliar produtos que comprou");
    }

    // Verificar se já existe review
    const reviewExistente = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.utilizador_id, utilizadorId),
          eq(reviews.produto_id, produtoId),
          isNull(reviews.deletado_em)
        )
      )
      .limit(1) as any[];

    if (reviewExistente.length > 0) {
      throw new Error("Você já avaliou este produto");
    }

    // Criar review
    const novoReview = {
      id: uuidv4(),
      utilizador_id: utilizadorId,
      produto_id: produtoId,
      pedido_id: pedidoCompra[0].id,
      rating,
      comentario: comentario || null,
      moderado: false,
      criado_em: new Date(),
      atualizado_em: new Date(),
    };

    await db.insert(reviews).values(novoReview);
    return novoReview;
  },

  /**
   * Obter reviews de um produto (apenas não deletados)
   */
  async obterReviewsProduto(produtoId: string, limite = 10) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const reviewsProduto = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comentario: reviews.comentario,
        criado_em: reviews.criado_em,
        usuario_nome: utilizadores.nome_completo,
        moderado: reviews.moderado,
      })
      .from(reviews)
      .innerJoin(utilizadores, eq(reviews.utilizador_id, utilizadores.id))
      .where(
        and(
          eq(reviews.produto_id, produtoId),
          isNull(reviews.deletado_em),
          eq(reviews.moderado, true) // Mostrar apenas reviews moderados
        )
      )
      .orderBy(reviews.criado_em)
      .limit(limite);

    return reviewsProduto;
  },

  /**
   * Obter estatísticas de reviews de um produto
   */
  async obterEstatisticasProduto(produtoId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const reviewsProduto = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.produto_id, produtoId),
          isNull(reviews.deletado_em),
          eq(reviews.moderado, true)
        )
      );

    if (reviewsProduto.length === 0) {
      return {
        total: 0,
        media: 0,
        distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let soma = 0;

    reviewsProduto.forEach((review) => {
      soma += review.rating;
      distribuicao[review.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return {
      total: reviewsProduto.length,
      media: (soma / reviewsProduto.length).toFixed(1),
      distribuicao,
    };
  },

  /**
   * Deletar review (soft delete)
   * Admin pode deletar qualquer review, usuário só o seu
   */
  async deletarReview(reviewId: string, utilizadorId: number, isAdmin = false) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (review.length === 0) {
      throw new Error("Review não encontrado");
    }

    // Validar permissão
    if (!isAdmin && (review as any)[0].utilizador_id !== utilizadorId) {
      throw new Error("Você não tem permissão para deletar este review");
    }

    // Soft delete
    await db
      .update(reviews)
      .set({ deletado_em: new Date() })
      .where(eq(reviews.id, reviewId));

    return { sucesso: true };
  },

  /**
   * Moderar review (admin)
   * Marca review como moderado para aparecer no site
   */
  async moderarReview(reviewId: string, aprovado: boolean) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (review.length === 0) {
      throw new Error("Review não encontrado");
    }

    if (aprovado) {
      await db
        .update(reviews)
        .set({ moderado: true })
        .where(eq(reviews.id, reviewId));
    } else {
      // Se não aprovado, fazer soft delete
      await db
        .update(reviews)
        .set({ deletado_em: new Date() })
        .where(eq(reviews.id, reviewId));
    }

    return { sucesso: true };
  },

  /**
   * Obter reviews pendentes de moderação (admin)
   */
  async obterReviewsPendentes(limite = 20) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const reviewsPendentes = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comentario: reviews.comentario,
        criado_em: reviews.criado_em,
        usuario_nome: utilizadores.nome_completo,
        usuario_email: utilizadores.email,
        produto_nome: produtos.nome,
      })
      .from(reviews)
      .innerJoin(utilizadores, eq(reviews.utilizador_id, utilizadores.id))
      .innerJoin(produtos, eq(reviews.produto_id, produtos.id))
      .where(
        and(
          eq(reviews.moderado, false),
          isNull(reviews.deletado_em)
        )
      )
      .orderBy(reviews.criado_em)
      .limit(limite);

    return reviewsPendentes;
  },
};
