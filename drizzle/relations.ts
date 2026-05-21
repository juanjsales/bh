import { relations } from "drizzle-orm/relations";
import { produtos, produtosAssinaturasPivot } from "./schema";

export const produtosAssinaturasPivotRelations = relations(produtosAssinaturasPivot, ({one}) => ({
	produto: one(produtos, {
		fields: [produtosAssinaturasPivot.produtoId],
		references: [produtos.id]
	}),
}));

export const produtosRelations = relations(produtos, ({many}) => ({
	produtosAssinaturasPivots: many(produtosAssinaturasPivot),
}));