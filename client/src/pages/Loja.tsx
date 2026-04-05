import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, Home, RefreshCw, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface CarrinhoItem {
  produto_id: string;
  quantidade: number;
  tipo_compra: "avulsa" | "assinatura";
}

export default function Loja() {
  const { isAuthenticated } = useAuth();
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [showCarrinho, setShowCarrinho] = useState(false);

  const produtosQuery = trpc.produtos.listar.useQuery();
  const adicionarAoCarrinhoMutation = trpc.carrinho.adicionar.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Você precisa estar logado para acessar a loja</p>
          <Link href="/">
            <Button>Voltar para Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleAdicionarAoCarrinho = (produtoId: string, tipo: "avulsa" | "assinatura") => {
    const itemExistente = carrinho.find(
      (item) => item.produto_id === produtoId && item.tipo_compra === tipo
    );

    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.produto_id === produtoId && item.tipo_compra === tipo
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        { produto_id: produtoId, quantidade: 1, tipo_compra: tipo },
      ]);
    }

    toast.success("Produto adicionado ao carrinho!");
  };

  const handleRemoverDoCarrinho = (produtoId: string, tipo: "avulsa" | "assinatura") => {
    setCarrinho(
      carrinho.filter(
        (item) => !(item.produto_id === produtoId && item.tipo_compra === tipo)
      )
    );
  };

  const totalCarrinho = carrinho.reduce((total, item) => {
    const produto = produtosQuery.data?.find((p) => p.id === item.produto_id);
    if (!produto) return total;

    const preco =
      item.tipo_compra === "avulsa"
        ? parseFloat(produto.preco_avulso)
        : parseFloat(produto.preco_assinatura || produto.preco_avulso);

    return total + preco * item.quantidade;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Loja Box & Health</h1>
          <button
            onClick={() => setShowCarrinho(!showCarrinho)}
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-accent" />
            {carrinho.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {carrinho.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Produtos */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-foreground mb-6">Catálogo de Caixas</h2>

            {produtosQuery.isLoading ? (
              <p className="text-muted-foreground">Carregando produtos...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {produtosQuery.data?.map((produto: any) => (
                  <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Imagem */}
                    <div className="h-48 bg-muted overflow-hidden">
                      {produto.imagem_url ? (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4">
                      <div className="inline-block px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium mb-2">
                        {produto.categoria}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{produto.nome}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {produto.descricao}
                      </p>

                      {/* Preços */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avulsa:</span>
                          <span className="font-bold text-accent">R$ {produto.preco_avulso}</span>
                        </div>
                        {produto.preco_assinatura && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Assinatura:</span>
                            <span className="font-bold text-accent">R$ {produto.preco_assinatura}</span>
                          </div>
                        )}
                      </div>

                      {/* Botões */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleAdicionarAoCarrinho(produto.id, "avulsa")}
                          className="w-full"
                          size="sm"
                        >
                          Adicionar (Avulsa)
                        </Button>
                        {produto.preco_assinatura && (
                          <Button
                            onClick={() => handleAdicionarAoCarrinho(produto.id, "assinatura")}
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            Adicionar (Assinatura)
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Carrinho Lateral */}
          {showCarrinho && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20 h-[calc(100vh-100px)] flex flex-col">
                <h3 className="font-bold text-2xl text-foreground mb-4">Seu Carrinho</h3>

                {carrinho.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Carrinho vazio</p>
                ) : (
                  <>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-6">
                      {carrinho.map((item) => {
                        const produto = produtosQuery.data?.find((p) => p.id === item.produto_id);
                        if (!produto) return null;

                        const preco =
                          item.tipo_compra === "avulsa"
                            ? parseFloat(produto.preco_avulso)
                            : parseFloat(produto.preco_assinatura || produto.preco_avulso);

                        return (
                          <div
                            key={`${item.produto_id}-${item.tipo_compra}`}
                            className="bg-muted/30 border border-border rounded-lg p-4 transition-all hover:border-accent/30"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground line-clamp-1">{produto.nome}</p>
                                <div className="mt-1">
                                  {item.tipo_compra === "avulsa" ? (
                                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0 px-2 h-5">
                                      <ShoppingBag className="w-3 h-3" />
                                      Compra Avulsa
                                    </Badge>
                                  ) : (
                                    <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 text-[10px] py-0 px-2 h-5">
                                      <RefreshCw className="w-3 h-3" />
                                      Assinatura
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoverDoCarrinho(item.produto_id, item.tipo_compra)}
                                className="p-1.5 hover:bg-red-100 text-muted-foreground hover:text-red-600 rounded-full transition-colors"
                                title="Remover item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center bg-background border border-border rounded-md px-1">
                                <button
                                  onClick={() => {
                                    const novoCarrinho = carrinho.map((i) =>
                                      i.produto_id === item.produto_id && i.tipo_compra === item.tipo_compra
                                        ? { ...i, quantidade: Math.max(1, i.quantidade - 1) }
                                        : i
                                    );
                                    setCarrinho(novoCarrinho);
                                  }}
                                  className="p-1 hover:text-accent rounded transition-colors"
                                  disabled={item.quantidade <= 1}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold w-8 text-center">{item.quantidade}</span>
                                <button
                                  onClick={() => {
                                    const novoCarrinho = carrinho.map((i) =>
                                      i.produto_id === item.produto_id && i.tipo_compra === item.tipo_compra
                                        ? { ...i, quantidade: i.quantidade + 1 }
                                        : i
                                    );
                                    setCarrinho(novoCarrinho);
                                  }}
                                  className="p-1 hover:text-accent rounded transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] text-muted-foreground leading-none">Subtotal</p>
                                <p className="text-sm font-bold text-accent">
                                  R$ {(preco * item.quantidade).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-border pt-4 mt-auto">
                      <div className="flex justify-between mb-4">
                        <span className="font-bold text-foreground">Total:</span>
                        <span className="font-bold text-accent text-lg">R$ {totalCarrinho.toFixed(2)}</span>
                      </div>
                      <Button className="w-full">Ir para Checkout</Button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
