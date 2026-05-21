import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  produto_id: string;
  quantidade: number;
  tipo_compra: "avulsa" | "assinatura";
  assinaturaId?: string;
  preco: number;
}

interface CartStore {
  items: CartItem[];
  adicionarItem: (item: CartItem) => void;
  removerItem: (produto_id: string, tipo_compra: "avulsa" | "assinatura") => void;
  limparCarrinho: () => void;
  incrementarQuantidade: (produto_id: string, tipo_compra: "avulsa" | "assinatura") => void;
  decrementarQuantidade: (produto_id: string, tipo_compra: "avulsa" | "assinatura") => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      adicionarItem: (item) =>
        set((state) => {
          const itemExistente = state.items.find(
            (i) => i.produto_id === item.produto_id && i.tipo_compra === item.tipo_compra
          );
          if (itemExistente) {
            return {
              items: state.items.map((i) =>
                i.produto_id === item.produto_id && i.tipo_compra === item.tipo_compra
                  ? { ...i, quantidade: i.quantidade + item.quantidade }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removerItem: (produto_id, tipo_compra) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.produto_id === produto_id && i.tipo_compra === tipo_compra)
          ),
        })),
      limparCarrinho: () => set({ items: [] }),
      incrementarQuantidade: (produto_id, tipo_compra) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.produto_id === produto_id && i.tipo_compra === tipo_compra
              ? { ...i, quantidade: i.quantidade + 1 }
              : i
          ),
        })),
      decrementarQuantidade: (produto_id, tipo_compra) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.produto_id === produto_id && i.tipo_compra === tipo_compra
              ? { ...i, quantidade: Math.max(1, i.quantidade - 1) }
              : i
          ),
        })),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.preco * item.quantidade, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
