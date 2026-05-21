import { upsertUtilizador } from "../server/db.ts";
import { utilizadores } from "../drizzle/schema.ts";

async function runUpdate() {
  const userData = {
    openId: "juangomes.sales@gmail.com", 
    nomeCompleto: "Juan Sales",
    email: "juangomes.sales@gmail.com",
    telefone: "21981756362",
    enderecoRua: "Estrada de Manguinhos",
    enderecoNumero: "123",
    enderecoComplemento: "Apartamento 4",
    enderecoBairro: "Manguinhos",
    enderecoCidade: "Rio de Janeiro",
    enderecoEstado: "RJ",
    enderecoCep: "21050007",
    role: "cliente",
    senhaHash: "230496",
  } as any;

  try {
    console.log("Atualizando usuário...");
    await upsertUtilizador(userData);
    console.log("Usuário atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
  }
}

runUpdate();
