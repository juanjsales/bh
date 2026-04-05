import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock das dependências
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      onDuplicateKeyUpdate: vi.fn().mockReturnThis(),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }),
  }),
}));

vi.mock("./services/authService", () => ({
  registerLocal: vi.fn().mockResolvedValue({ userId: 1 }),
  loginLocal: vi.fn().mockResolvedValue({ id: 1, nome_completo: "Novo Usuário", openId: "1" }),
}));

vi.mock("./services/quizService", () => ({
  salvarPerfilQuiz: vi.fn().mockResolvedValue(1),
}));

describe("Quiz Procedures - Auth", () => {
  it("should register and save quiz responses when user is not logged in", async () => {
    // Context without user
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        cookie: (name: string, value: string, options: any) => {},
        clearCookie: () => {},
      } as any as TrpcContext["res"],
    };
    
    const caller = appRouter.createCaller(ctx);

    const respostas = {
      qualidade_sono: 1,
    };

    const result = await caller.quiz.salvarRespostas({
      respostas_brutas: respostas,
      categoria_calculada: "energia",
      registro: {
        email: "novo@example.com",
        senha: "password123",
        nome_completo: "Novo Usuário",
      }
    });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty("id");
  });
});
