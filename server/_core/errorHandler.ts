/**
 * Error Handler Middleware
 * Tratamento centralizado de erros para tRPC
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Tipos de erro da aplicação
 */
export enum ErrorType {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Mapeia erros internos para TRPCError com mensagens seguras
 * @param error - Erro capturado
 * @returns TRPCError com mensagem apropriada
 */
export function handleError(error: unknown): TRPCError {
  // Erro de validação Zod
  if (error instanceof z.ZodError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: "Dados de entrada inválidos",
      cause: error,
    });
  }

  // Erro de autenticação
  if (error instanceof Error && error.message.includes("Unauthorized")) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você não está autenticado",
    });
  }

  // Erro de autorização
  if (error instanceof Error && error.message.includes("Forbidden")) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para acessar este recurso",
    });
  }

  // Erro de banco de dados
  if (error instanceof Error && error.message.includes("Database")) {
    console.error("Database error:", error);
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao processar solicitação",
    });
  }

  // Erro genérico
  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao processar solicitação",
    });
  }

  // Erro desconhecido
  console.error("Unknown error:", error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Erro desconhecido ao processar solicitação",
  });
}

/**
 * Wrapper para procedures que garante tratamento de erro
 * @param fn - Função a ser executada
 * @returns Resultado ou TRPCError
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw handleError(error);
  }
}
