import { describe, expect, it } from "vitest";
import { gerarDadosPix } from "./services/pixService";

describe("PIX Service", () => {
  it("deve gerar dados PIX válidos", () => {
    const chave = "123.456.789-00";
    const valor = 89.90;
    const descricao = "Pedido #12345";

    const dados = gerarDadosPix(chave, valor, descricao);
    const parsed = JSON.parse(dados);

    expect(parsed.chave).toBe(chave);
    expect(parsed.valor).toBe("89.90");
    expect(parsed.descricao).toBe(descricao);
    expect(parsed.timestamp).toBeDefined();
  });

  it("deve truncar descrição com mais de 79 caracteres", () => {
    const descricaoLonga = "A".repeat(100);
    const dados = gerarDadosPix("chave", 100, descricaoLonga);
    const parsed = JSON.parse(dados);

    expect(parsed.descricao.length).toBeLessThanOrEqual(79);
  });

  it("deve formatar valor com 2 casas decimais", () => {
    const dados = gerarDadosPix("chave", 10, "desc");
    const parsed = JSON.parse(dados);

    expect(parsed.valor).toBe("10.00");
  });
});
