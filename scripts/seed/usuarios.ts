import "dotenv/config";
import { getDb } from "../../server/db";
import { utilizadores } from "../../drizzle/schema";
import bcrypt from "bcryptjs";

export async function seedUsuarios() {
  const db = await getDb();
  if (!db) {
    throw new Error("Banco de dados não disponível");
  }

  console.log("👥 [SEED] Criando usuários...");
  const senhaHash = await bcrypt.hash("123456", 10);
  
  const usuariosData = [
    { nomeCompleto: "Juan Sales", email: "juan@exemplo.com", senhaHash, telefone: "11987654321", enderecoCompleto: "Rua Das Flores, 123, São Paulo, SP" },
    { nomeCompleto: "Maria Silva", email: "maria@exemplo.com", senhaHash, telefone: "11987654322", enderecoCompleto: "Av. Paulista, 500, São Paulo, SP" },
    { nomeCompleto: "Admin User", email: "admin@exemplo.com", senhaHash, telefone: "11987654323", enderecoCompleto: "Rua Admin, 1, São Paulo, SP" },
  ];

  const userIds: number[] = [];
  for (const userData of usuariosData) {
    const existing = await db.select().from(utilizadores).where((t) => t.email === userData.email).limit(1);
    if (existing.length > 0) {
      console.log(`  ! Usuário já existe, pulando: ${userData.email}`);
      userIds.push(existing[0].id);
      continue;
    }
    
    await db.insert(utilizadores).values({
      nomeCompleto: userData.nomeCompleto,
      email: userData.email,
      senhaHash: userData.senhaHash,
      telefone: userData.telefone,
      enderecoCompleto: userData.enderecoCompleto,
      role: userData.email === "admin@exemplo.com" ? "admin" : "cliente",
    });
    
    const result = await db.select().from(utilizadores).where((t) => t.email === userData.email).limit(1);
    if (result.length > 0) {
      userIds.push(result[0].id);
      console.log(`  ✓ Usuário criado: ${userData.email}`);
    }
  }
  return userIds;
}

if (require.main === module) {
  seedUsuarios().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
