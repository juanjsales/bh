import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Tentando conectar com:", connectionString);
  
  if (!connectionString) {
    console.error("DATABASE_URL não definida no .env");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(connectionString);
    console.log("Conexão bem-sucedida!");
    await connection.end();
  } catch (error) {
    console.error("Erro de conexão:", error);
    process.exit(1);
  }
}

testConnection();
