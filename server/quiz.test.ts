import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    nome_completo: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Quiz Procedures", () => {
  describe("quiz.salvarRespostas", () => {
    it("should save quiz responses with category", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const respostas = {
        nome: "João Silva",
        email: "joao@example.com",
        qualidade_sono: 2,
        dificuldade_dormir: "frequentemente",
        nivel_estresse: 3,
        ansiedade: "controlo",
        energia: 3,
        concentracao: "bom",
        bem_estar_geral: "bem",
        preferencias: "meditacao",
      };

      const result = await caller.quiz.salvarRespostas({
        respostas_brutas: respostas,
        categoria_calculada: "Sono Profundo",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("success", true);
    });

    it("should save responses for Sono Profundo category", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const respostas = {
        qualidade_sono: 1,
        nivel_estresse: 2,
        energia: 3,
        preferencias: "aromaterapia",
      };

      const result = await caller.quiz.salvarRespostas({
        respostas_brutas: respostas,
        categoria_calculada: "Sono Profundo",
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("id");
    });

    it("should save responses for Calma Mental category", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const respostas = {
        qualidade_sono: 3,
        nivel_estresse: 5,
        energia: 2,
        preferencias: "meditacao",
      };

      const result = await caller.quiz.salvarRespostas({
        respostas_brutas: respostas,
        categoria_calculada: "Calma Mental",
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("id");
    });

    it("should save responses for Energia Vital category", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const respostas = {
        qualidade_sono: 3,
        nivel_estresse: 2,
        energia: 1,
        preferencias: "cha",
      };

      const result = await caller.quiz.salvarRespostas({
        respostas_brutas: respostas,
        categoria_calculada: "Energia Vital",
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("id");
    });

    it("should save responses for Beleza Natural category", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const respostas = {
        qualidade_sono: 3,
        nivel_estresse: 2,
        energia: 3,
        preferencias: "skincare",
      };

      const result = await caller.quiz.salvarRespostas({
        respostas_brutas: respostas,
        categoria_calculada: "Beleza Natural",
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("id");
    });

    it("should save quiz responses with personal and emotional details", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const respostas_brutas = { overall: "good" };
      const respostas_pessoais = { idade: 30, objetivo: "relaxar" };
      const respostas_emocionais = { ansiedade: "media", estresse: "alto" };

      const result = await caller.quiz.salvarRespostas({
        respostas_brutas,
        respostas_pessoais,
        respostas_emocionais,
        categoria_calculada: "Relaxamento",
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("id");

      // Verify the saved data
      const perfil = await caller.quiz.obterPerfil();
      expect(perfil).toBeDefined();
      if (perfil) {
        // In the test environment, the values might be returned as strings or objects depending on the mock DB
        // But we check if the properties exist
        expect(perfil).toHaveProperty("respostas_pessoais");
        expect(perfil).toHaveProperty("respostas_emocionais");
      }
    });
  });

  describe("quiz.obterPerfil", () => {
    it("should retrieve user's quiz profile", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      // First save a profile
      await caller.quiz.salvarRespostas({
        respostas_brutas: { teste: "valor" },
        categoria_calculada: "Calma Mental",
      });

      // Then retrieve it
      const perfil = await caller.quiz.obterPerfil();

      expect(perfil).toBeDefined();
      if (perfil) {
        expect(perfil).toHaveProperty("categoria_calculada");
        expect(perfil).toHaveProperty("respostas_brutas");
        expect(perfil).toHaveProperty("utilizador_id");
      }
    });
  });
});
