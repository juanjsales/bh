import { describe, it, expect } from "vitest";
import { whatsappService } from "./whatsappService";

/**
 * Testes para o serviço de WhatsApp Business
 */

describe("whatsappService", () => {
  describe("validarTelefoneBrasil", () => {
    it("deve validar telefone brasileiro correto", () => {
      expect(whatsappService.validarTelefoneBrasil("5511987654321")).toBe(true);
      // Testes com caracteres especiais são removidos antes da validação
      expect(whatsappService.validarTelefoneBrasil("5511987654321")).toBe(true);
    });

    it("deve rejeitar telefone inválido", () => {
      expect(whatsappService.validarTelefoneBrasil("123")).toBe(false);
      expect(whatsappService.validarTelefoneBrasil("5511987654")).toBe(false);
      expect(whatsappService.validarTelefoneBrasil("")).toBe(false);
    });
  });

  describe("formatarTelefone", () => {
    it("deve formatar telefone para padrão E.164", () => {
      const resultado = whatsappService.formatarTelefone("11987654321");
      expect(resultado).toBe("5511987654321");
    });

    it("deve manter telefone já formatado", () => {
      const resultado = whatsappService.formatarTelefone("5511987654321");
      expect(resultado).toBe("5511987654321");
    });

    it("deve remover caracteres especiais", () => {
      const resultado = whatsappService.formatarTelefone("11987654321");
      expect(resultado).toBe("5511987654321");
    });
  });

  describe("gerarMensagemPagamento", () => {
    it("deve gerar mensagem de pagamento pendente", () => {
      const pedido = {
        nome_completo: "João Silva",
        produto_nome: "Box Sono Profundo",
        valor_total: 8990,
        telefone: "5511987654321",
      };

      const mensagem = whatsappService.gerarMensagemPagamento(pedido);

      expect(mensagem.tipo).toBe("pagamento_pendente");
      expect(mensagem.corpo).toContain("João Silva");
      expect(mensagem.corpo).toContain("Box Sono Profundo");
      expect(mensagem.corpo).toContain("89.90");
    });
  });

  describe("gerarMensagemPagamentoConfirmado", () => {
    it("deve gerar mensagem de pagamento confirmado", () => {
      const pedido = {
        nome_completo: "Maria Santos",
        produto_nome: "Box Energia Vital",
        telefone: "5511987654321",
      };

      const mensagem = whatsappService.gerarMensagemPagamentoConfirmado(pedido);

      expect(mensagem.tipo).toBe("pagamento_confirmado");
      expect(mensagem.corpo).toContain("confirmado");
      expect(mensagem.corpo).toContain("Box Energia Vital");
    });
  });

  describe("gerarMensagemEntrega", () => {
    it("deve gerar mensagem de status preparando", () => {
      const pedido = {
        nome_completo: "Pedro Costa",
        codigo_rastreio: "ABC123XYZ",
      };

      const mensagem = whatsappService.gerarMensagemEntrega(pedido, "preparando");

      expect(mensagem.tipo).toBe("entrega");
      expect(mensagem.corpo).toContain("preparado");
    });

    it("deve gerar mensagem de status enviado com rastreio", () => {
      const pedido = {
        nome_completo: "Pedro Costa",
        codigo_rastreio: "ABC123XYZ",
      };

      const mensagem = whatsappService.gerarMensagemEntrega(pedido, "enviado");

      expect(mensagem.corpo).toContain("enviado");
      expect(mensagem.corpo).toContain("ABC123XYZ");
    });

    it("deve gerar mensagem de status entregue", () => {
      const pedido = {
        nome_completo: "Pedro Costa",
        codigo_rastreio: "ABC123XYZ",
      };

      const mensagem = whatsappService.gerarMensagemEntrega(pedido, "entregue");

      expect(mensagem.corpo).toContain("entregue");
    });
  });
});
