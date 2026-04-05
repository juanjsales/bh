import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedAdmin = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const admin: AuthenticatedAdmin = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    nome_completo: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: admin,
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

function createUserContext(): TrpcContext {
  const user: AuthenticatedAdmin = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    nome_completo: "Regular User",
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

describe("Admin Procedures", () => {
  describe("produtos.criar", () => {
    it("should allow admin to create product", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.produtos.criar({
        nome: "Test Product",
        descricao: "Test Description",
        categoria: "Sono Profundo",
        preco_avulso: 99.99,
        preco_assinatura: 79.99,
        imagem_url: "https://example.com/image.jpg",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("success", true);
    });

    it("should deny regular user from creating product", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.produtos.criar({
          nome: "Test Product",
          descricao: "Test Description",
          categoria: "Sono Profundo",
          preco_avulso: 99.99,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Forbidden");
      }
    });
  });

  describe("pedidos.atualizarStatus", () => {
    it("should allow admin to update order status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pedidos.atualizarStatus({
        pedido_id: "test-pedido-id",
        status_pagamento: "pago",
      });

      expect(result).toHaveProperty("success", true);
    });

    it("should deny regular user from updating order status", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pedidos.atualizarStatus({
          pedido_id: "test-pedido-id",
          status_pagamento: "pago",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Forbidden");
      }
    });
  });

  describe("pedidos.obterTodos", () => {
    it("should allow admin to get all orders", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pedidos.obterTodos();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should deny regular user from getting all orders", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pedidos.obterTodos();
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Forbidden");
      }
    });
  });
});
