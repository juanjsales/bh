import { ADMIN_MENU_ITEMS } from "@/adminMenu";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Truck, Package, CheckCircle, Save } from "lucide-react";

type StatusPagamento = "pendente" | "pago" | "cancelado";
type StatusEnvio = "preparando" | "enviado" | "entregue";

const STATUS_PAGAMENTO_COLORS: Record<StatusPagamento, string> = {
  pendente: "bg-yellow-500",
  pago: "bg-green-500",
  cancelado: "bg-red-500",
};

const STATUS_ENVIO_COLORS: Record<StatusEnvio, string> = {
  preparando: "bg-blue-500",
  enviado: "bg-yellow-500",
  entregue: "bg-green-500",
};

export default function AdminPedidos() {
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | "todos">("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [codigosRastreioTemp, setCodigosRastreioTemp] = useState<Record<string, string>>({});

  const pedidosQuery = trpc.pedidos.obterTodos.useQuery();
  const atualizarStatusPagamentoMutation = trpc.pedidos.atualizarStatusPagamento.useMutation();
  const atualizarStatusEnvioMutation = trpc.pedidos.atualizarStatusEnvio.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Acesso restrito a administradores</p>
          <Link href="/dashboard">
            <Button>Voltar para Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleAtualizarPagamento = async (pedidoId: string, status: StatusPagamento) => {
    try {
      await atualizarStatusPagamentoMutation.mutateAsync({
        pedido_id: pedidoId,
        status,
      });
      toast.success("Status de pagamento atualizado!");
      pedidosQuery.refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status de pagamento");
    }
  };

  const handleAtualizarEnvio = async (pedidoId: string, status: StatusEnvio, codigoRastreio?: string) => {
    try {
      await atualizarStatusEnvioMutation.mutateAsync({
        pedido_id: pedidoId,
        status,
        codigo_rastreio: codigoRastreio,
      });
      toast.success("Status de envio atualizado!");
      pedidosQuery.refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status de envio");
    }
  };

  const handleSalvarRastreio = (pedidoId: string) => {
    const codigoRastreio = codigosRastreioTemp[pedidoId];
    // Precisa obter o status de envio atual do pedido
    const pedido = pedidosQuery.data?.find(p => p.id === pedidoId);
    if (pedido && codigoRastreio !== undefined) {
      handleAtualizarEnvio(pedidoId, pedido.statusEnvio as StatusEnvio, codigoRastreio);
    }
  };

  const pedidosFiltrados = pedidosQuery.data?.filter((pedido: any) => {
    if (filtroStatus === "todos") return true;
    return pedido.statusPagamento === filtroStatus;
  });

  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <h1 className="text-2xl font-bold text-foreground mb-8">Gerenciar Pedidos</h1>
      
      <div className="space-y-4">
        {pedidosQuery.isLoading ? (
          <p className="text-muted-foreground">Carregando pedidos...</p>
        ) : (
          pedidosFiltrados?.map((pedido: any) => (
            <Card key={pedido.id} className="p-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedId(expandedId === pedido.id ? null : pedido.id)}>
                <div>
                  <p className="font-mono font-bold">{pedido.id.substring(0, 8)}...</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{pedido.statusPagamento}</Badge>
                    <Badge className={STATUS_ENVIO_COLORS[pedido.statusEnvio as StatusEnvio] || "bg-gray-500"}>{pedido.statusEnvio || "preparando"}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedId === pedido.id ? "Ocultar" : "Detalhes"}
                </Button>
              </div>
              {expandedId === pedido.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status do Pagamento:</label>
                      <Select
                        defaultValue={pedido.statusPagamento || "pendente"}
                        onValueChange={(value: StatusPagamento) => handleAtualizarPagamento(pedido.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status do Envio:</label>
                      <Select
                        defaultValue={pedido.statusEnvio || "preparando"}
                        onValueChange={(value: StatusEnvio) => handleAtualizarEnvio(pedido.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preparando"><Package className="inline mr-2 h-4 w-4" />Preparando</SelectItem>
                          <SelectItem value="enviado"><Truck className="inline mr-2 h-4 w-4" />Enviado</SelectItem>
                          <SelectItem value="entregue"><CheckCircle className="inline mr-2 h-4 w-4" />Entregue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Código de Rastreio" 
                      defaultValue={pedido.codigoRastreio || ""}
                      onChange={(e) => setCodigosRastreioTemp({...codigosRastreioTemp, [pedido.id]: e.target.value})}
                    />
                    <Button size="sm" onClick={() => handleSalvarRastreio(pedido.id)}>
                      <Save className="mr-2 h-4 w-4" /> Salvar Rastreio
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
