import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { Badge } from "@/components/ui/badge";

export default function Checkout() {
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, removerItem, incrementarQuantidade, decrementarQuantidade, getTotal } = useCartStore();

  const criarPagamento = trpc.pix.criarPagamento.useMutation({
    onSuccess: (data) => {
      toast.success("Pedido criado com sucesso!");
      navigate(`/pagamento-pix/${data.id}`);
    },
    onError: (err) => {
      toast.error(`Erro ao criar pagamento: ${err.message}`);
      setIsProcessing(false);
    },
  });

  const handleFinalizarCompra = () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    
    // Simplificando para enviar a descrição do primeiro item ou um resumo
    criarPagamento.mutate({
      valor: getTotal(),
      descricao: `Compra de ${items.length} item(ns)`,
    });
  };

  if (items.length === 0) {
    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">Seu Carrinho está vazio</h1>
            <Button onClick={() => navigate("/")}>Voltar para Loja</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={`${item.produto_id}-${item.tipo_compra}`} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.produto_id}</p> {/* Exibir nome do produto se disponível */}
                  <Badge variant={item.tipo_compra === "avulsa" ? "secondary" : "default"}>
                    {item.tipo_compra}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => decrementarQuantidade(item.produto_id, item.tipo_compra)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantidade}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => incrementarQuantidade(item.produto_id, item.tipo_compra)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                  </div>
                  <span className="font-bold w-20 text-right">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removerItem(item.produto_id, item.tipo_compra)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-4 flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-accent">R$ {getTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleFinalizarCompra}
          disabled={isProcessing}
        >
          {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : "Pagar com PIX"}
        </Button>
      </div>
    </div>
  );
}
