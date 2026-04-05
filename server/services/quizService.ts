/**
 * Quiz Service
 * Lógica de negócio para gerenciar perfis de quiz e recomendações
 */

import { getDb } from "../db";
import { perfis_quiz } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

/**
 * Schema validado para respostas do quiz
 * Garante que apenas valores válidos sejam aceitos
 */
const RespostasSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);

export type RespostasValidadas = z.infer<typeof RespostasSchema>;

/**
 * Calcula a categoria recomendada baseada nas respostas do quiz
 * @param respostas - Respostas brutas do usuário
 * @returns Categoria calculada (sono, energia, calma, beleza, equilibrio)
 */
export function calcularCategoria(respostas: RespostasValidadas): string {
  const scores: Record<string, number> = {
    sono: 0,
    energia: 0,
    calma: 0,
    beleza: 0,
    equilibrio: 0,
  };

  // Mapear respostas para scores (lógica simplificada)
  Object.entries(respostas).forEach(([chave, valor]) => {
    if (typeof valor === "number") {
      if (chave.includes("sono")) scores.sono += valor;
      if (chave.includes("energia")) scores.energia += valor;
      if (chave.includes("calma")) scores.calma += valor;
      if (chave.includes("beleza")) scores.beleza += valor;
      if (chave.includes("equilibrio")) scores.equilibrio += valor;
    }
  });

  // Retornar categoria com maior score
  return Object.entries(scores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];
}

/**
 * Salva as respostas do quiz no banco de dados
 * @param utilizadorId - ID do usuário
 * @param respostas - Respostas validadas do quiz
 * @param categoria - Categoria calculada
 * @returns ID do perfil criado
 */
export async function salvarPerfilQuiz(
  utilizadorId: number,
  respostas: RespostasValidadas,
  categoria: string,
  respostasPessoais?: Record<string, any>,
  respostasEmocionais?: Record<string, any>,
  cliente_nome?: string,
  cliente_email?: string,
  cliente_whatsapp?: string,
  cliente_cep?: string
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validar categoria
  const categoriasValidas = ["sono", "energia", "calma", "beleza", "equilibrio"];
  if (!categoriasValidas.includes(categoria)) {
    throw new Error(`Categoria inválida: ${categoria}`);
  }

  const perfilId = uuidv4();

  await db.insert(perfis_quiz).values({
    id: perfilId,
    utilizador_id: utilizadorId,
    respostas_brutas: JSON.stringify(respostas),
    respostas_pessoais: respostasPessoais ? JSON.stringify(respostasPessoais) : null,
    respostas_emocionais: respostasEmocionais ? JSON.stringify(respostasEmocionais) : null,
    categoria_calculada: categoria,
    cliente_nome: cliente_nome,
    cliente_email: cliente_email,
    cliente_whatsapp: cliente_whatsapp,
    cliente_cep: cliente_cep,
  } as any);

  return perfilId;
}

/**
 * Obtém o perfil de quiz mais recente do usuário
 * @param utilizadorId - ID do usuário
 * @returns Perfil do quiz ou null
 */
export async function obterPerfilQuizRecente(utilizadorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const perfil = await db
    .select()
    .from(perfis_quiz)
    .where(eq(perfis_quiz.utilizador_id, utilizadorId))
    .orderBy((t) => t.criado_em)
    .limit(1);

  return perfil.length > 0 ? perfil[0] : null;
}

/**
 * Valida e processa respostas do quiz
 * @param respostasRutas - Respostas não validadas
 * @returns Respostas validadas
 */
export function validarRespostas(respostasRutas: unknown): RespostasValidadas {
  try {
    return RespostasSchema.parse(respostasRutas);
  } catch (error) {
    throw new Error("Respostas do quiz inválidas");
  }
}
