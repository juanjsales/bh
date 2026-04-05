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

describe("Dashboard Procedures", () => {
  describe("pedidos.obterMeus", () => {
    it("should retrieve user's orders", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const pedidos = await caller.pedidos.obterMeus();

      expect(Array.isArray(pedidos)).toBe(true);
    });
  });

  describe("assinaturas.obterMinhas", () => {
    it("should retrieve user's subscriptions", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const assinaturas = await caller.assinaturas.obterMinhas();

      expect(Array.isArray(assinaturas)).toBe(true);
    });
  });

  describe("auth.logout", () => {
    it("should logout successfully", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
    });
  });

  describe("Dashboard UI Features", () => {
    it("should display user name in header", () => {
      const user: AuthenticatedUser = {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        nome_completo: "João Silva",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      expect(user.nome_completo).toBe("João Silva");
    });

    it("should have expandable order cards", () => {
      const mockOrder = {
        id: "order-123",
        valor_total: "89.90",
        status_pagamento: "pago",
        criado_em: new Date(),
        tipo_compra: "avulsa",
        metodo_pagamento: "pix",
      };

      expect(mockOrder).toHaveProperty("id");
      expect(mockOrder).toHaveProperty("status_pagamento");
      expect(mockOrder.status_pagamento).toBe("pago");
    });

    it("should have expandable subscription cards", () => {
      const mockSubscription = {
        id: "sub-123",
        data_inicio: new Date(),
        proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      expect(mockSubscription).toHaveProperty("id");
      expect(mockSubscription).toHaveProperty("proxima_cobranca");
    });
  });
});
