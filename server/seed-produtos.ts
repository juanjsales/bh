import { getDb } from "./db";
import { produtos } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";

const PRODUTOS_SEED = [
  {
    nome: "Box Sono Profundo",
    descricao: "Ritual de sono com lavanda, camomila e ingredientes naturais para noites tranquilas e restauradoras. Perfeito para quem busca melhorar a qualidade do sono.",
    categoria: "Sono Profundo",
    preco_avulso: "89.90",
    preco_assinatura: "76.41",
    imagem_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663492755131/Vruftkpt8c5NfqaQ9bJ7wu/box-sono-profundo-HwTwRzDqtD48FFNLgavbzX.webp",
  },
  {
    nome: "Box Energia Vital",
    descricao: "Energize seu dia com chá verde, gengibre, limão e ervas tonificantes. Ideal para aumentar disposição, foco e vitalidade ao longo do dia.",
    categoria: "Energia Vital",
    preco_avulso: "79.90",
    preco_assinatura: "67.91",
    imagem_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663492755131/Vruftkpt8c5NfqaQ9bJ7wu/box-energia-vital-aSsWYA5FseCrp9UfMPrkeh.webp",
  },
  {
    nome: "Box Calma Mental",
    descricao: "Encontre paz interior com sálvia, eucalipto e pedras de meditação. Perfeito para reduzir estresse, ansiedade e cultivar mindfulness diário.",
    categoria: "Calma Mental",
    preco_avulso: "84.90",
    preco_assinatura: "72.16",
    imagem_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663492755131/Vruftkpt8c5NfqaQ9bJ7wu/box-calma-mental-DBE8fNMRdX2JeC7xok5FPu.webp",
  },
  {
    nome: "Box Beleza Natural",
    descricao: "Cuide de sua pele com óleos naturais, pétalas de rosa, mel e ingredientes botânicos puros. Ritual de beleza que nutre e rejuvenesce.",
    categoria: "Beleza Natural",
    preco_avulso: "99.90",
    preco_assinatura: "84.91",
    imagem_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663492755131/Vruftkpt8c5NfqaQ9bJ7wu/box-beleza-natural-Kg6zpWXz7hes9WL4VnMgyx.webp",
  },
  {
    nome: "Box Equilíbrio Corpo",
    descricao: "Harmonize corpo e mente com cúrcuma, gengibre, ervas adaptogênicas e ingredientes wellness. Perfeito para bem-estar holístico e equilíbrio.",
    categoria: "Equilíbrio Corpo",
    preco_avulso: "94.90",
    preco_assinatura: "80.66",
    imagem_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663492755131/Vruftkpt8c5NfqaQ9bJ7wu/box-equilibrio-corpo-VT2bsDyD2XLyzTUvtjTedC.webp",
  },
];

async function seedProdutos() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      process.exit(1);
    }

    console.log("🌱 Iniciando seed de produtos...");

    for (const produto of PRODUTOS_SEED) {
      const id = uuidv4();
      await db.insert(produtos).values({
        id,
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        preco_avulso: produto.preco_avulso,
        preco_assinatura: produto.preco_assinatura,
        imagem_url: produto.imagem_url,
      } as any);

      console.log(`✅ Produto inserido: ${produto.nome}`);
    }

    console.log("🎉 Seed de produtos concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fazer seed de produtos:", error);
    process.exit(1);
  }
}

seedProdutos();
