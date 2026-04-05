import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { toast } from "sonner";

type StatusPagamento = "pendente" | "pago" | "cancelado";
type StatusEnvio = "nao_enviado" | "enviado" | "entregue" | "cancelado";

export default function AdminPedidos() {
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | "todos">("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pedidosQuery = trpc.pedidos.obterTodos.useQuery();
  const atualizarStatusMutation = trpc.pedidos.atualizarStatus.useMutation();

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

  const handleAtualizarStatus = async (pedidoId: string, novoStatus: StatusPagamento) => {
    try {
      await atualizarStatusMutation.mutateAsync({
        pedido_id: pedidoId,
        status_pagamento: novoStatus,
      });
      toast.success("Status atualizado com sucesso!");
      pedidosQuery.refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const pedidosFiltrados = pedidosQuery.data?.filter((pedido: any) => {
    if (filtroStatus === "todos") return true;
    return pedido.status_pagamento === filtroStatus;
  });

  const getStatusIcon = (status: StatusPagamento) => {
    switch (status) {
      case "pago":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pendente":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "cancelado":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: StatusPagamento) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusLabel = (status: StatusPagamento) => {
    switch (status) {
      case "pago":
        return "Pago";
      case "pendente":
        return "Pendente";
      case "cancelado":
        return "Cancelado";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Pedidos</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="container py-8">
        {/* Filtros */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <Button
            variant={filtroStatus === "todos" ? "default" : "outline"}
            onClick={() => setFiltroStatus("todos")}
            size="sm"
          >
            Todos ({pedidosQuery.data?.length || 0})
          </Button>
          <Button
            variant={filtroStatus === "pendente" ? "default" : "outline"}
            onClick={() => setFiltroStatus("pendente")}
            size="sm"
          >
            Pendentes ({pedidosQuery.data?.filter((p: any) => p.status_pagamento === "pendente").length || 0})
          </Button>
          <Button
            variant={filtroStatus === "pago" ? "default" : "outline"}
            onClick={() => setFiltroStatus("pago")}
            size="sm"
          >
            Pagos ({pedidosQuery.data?.filter((p: any) => p.status_pagamento === "pago").length || 0})
          </Button>
          <Button
            variant={filtroStatus === "cancelado" ? "default" : "outline"}
            onClick={() => setFiltroStatus("cancelado")}
            size="sm"
          >
            Cancelados ({pedidosQuery.data?.filter((p: any) => p.status_pagamento === "cancelado").length || 0})
          </Button>
        </div>

        {/* Pedidos List */}
        <div>
          {pedidosQuery.isLoading ? (
            <p className="text-muted-foreground">Carregando pedidos...</p>
          ) : pedidosFiltrados?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados?.map((pedido: any) => (
                <Card
                  key={pedido.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setExpandedId(expandedId === pedido.id ? null : pedido.id)}
                >
                  {/* Header do Pedido */}
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">ID do Pedido</p>
                      <p className="font-mono text-sm font-bold text-foreground">
                        {pedido.id.substring(0, 8)}...
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium text-foreground">{pedido.utilizador?.nome_completo || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-bold text-accent">R$ {parseFloat(pedido.valor_total).toFixed(2)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pedido.status_pagamento)}`}>
                        {getStatusIcon(pedido.status_pagamento)}
                        {getStatusLabel(pedido.status_pagamento)}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="text-sm text-foreground">
                        {new Date(pedido.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {expandedId === pedido.id && (
                    <div className="mt-6 pt-6 border-t border-border space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Informações do Pedido */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Informações do Pedido</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Tipo de Compra:</span>
                              <p className="font-medium text-foreground capitalize">
                                {pedido.tipo_compra === "avulsa" ? "Avulsa" : "Assinatura"}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Produto:</span>
                              <p className="font-medium text-foreground">{pedido.produto?.nome || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Criado em:</span>
                              <p className="font-medium text-foreground">
                                {new Date(pedido.criado_em).toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Informações do Cliente */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Informações do Cliente</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <p className="font-medium text-foreground">{pedido.utilizador?.email || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Telefone:</span>
                              <p className="font-medium text-foreground">{pedido.utilizador?.telefone || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ações de Status */}
                      <div className="pt-4 border-t border-border">
                        <h4 className="font-semibold text-foreground mb-3">Atualizar Status de Pagamento</h4>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant={pedido.status_pagamento === "pendente" ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                e.stopPropagation();
                handleAtualizarStatus(pedido.id, "pendente");
              }}
                            disabled={atualizarStatusMutation.isPending}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Pendente
                          </Button>
                          <Button
                            variant={pedido.status_pagamento === "pago" ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                e.stopPropagation();
                handleAtualizarStatus(pedido.id, "pago");
              }}
                            disabled={atualizarStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Pago
                          </Button>
                          <Button
                            variant={pedido.status_pagamento === "cancelado" ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                e.stopPropagation();
                handleAtualizarStatus(pedido.id, "cancelado");
              }}
                            disabled={atualizarStatusMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
