import { registerLocal } from "../server/services/authService.ts";

async function run() {
  try {
    console.log("Registrando usuário...");
    const result = await registerLocal(
      "juangomes.sales@gmail.com",
      "230496",
      "Juan Sales"
    );
    console.log("Usuário registrado com sucesso:", result);
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
  }
}

run();
