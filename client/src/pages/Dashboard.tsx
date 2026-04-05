import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { LogOut, ShoppingBag, Heart, Settings, Store, Calendar, AlertCircle, Check, Clock, X, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"pedidos" | "assinaturas" | "perfil" | "admin" | "quiz">("pedidos");
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);
  const [expandedAssinatura, setExpandedAssinatura] = useState<string | null>(null);

  const pedidosQuery = trpc.pedidos.obterMeus.useQuery();
  const assinaturasQuery = trpc.assinaturas.obterMinhas.useQuery();
  const quizQuery = trpc.quiz.obterPerfil.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pago":
        return <Check className="w-4 h-4" />;
      case "pendente":
        return <Clock className="w-4 h-4" />;
      case "cancelado":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Minha Conta</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user?.nome_completo || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card sticky top-16 z-40">
        <div className="container flex gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "pedidos"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Meus Pedidos
          </button>
          <button
            onClick={() => setActiveTab("assinaturas")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "assinaturas"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Assinaturas
          </button>
          <button
            onClick={() => setActiveTab("perfil")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "perfil"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Meus Dados
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Meu Quiz
          </button>
          <Link href="/loja">
            <button className="px-4 py-4 font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Loja
            </button>
          </Link>
          {user?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "admin"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="w-4 h-4 inline mr-2" />
              Admin
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="container py-8">
        {/* Pedidos Tab */}
        {activeTab === "pedidos" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Meus Pedidos</h2>
            {pedidosQuery.isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Carregando pedidos...</p>
              </Card>
            ) : pedidosQuery.data?.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não tem pedidos.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pedidosQuery.data?.map((pedido: any) => (
                  <Card key={pedido.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <button
                      onClick={() => setExpandedPedido(expandedPedido === pedido.id ? null : pedido.id)}
                      className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="w-5 h-5 text-accent" />
                            <p className="font-semibold text-foreground">Pedido #{pedido.id.slice(0, 8)}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pedido.criado_em).toLocaleDateString("pt-BR", { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-accent mb-2">
                            R$ {parseFloat(pedido.valor_total).toFixed(2)}
                          </p>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pedido.status_pagamento)}`}>
                            {getStatusIcon(pedido.status_pagamento)}
                            {pedido.status_pagamento === "pago" ? "Pago" : 
                             pedido.status_pagamento === "pendente" ? "Pendente" : "Cancelado"}
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground ml-4 transition-transform ${expandedPedido === pedido.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Detalhes Expandidos */}
                    {expandedPedido === pedido.id && (
                      <div className="border-t border-border p-6 bg-muted/30 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">ID Completo</p>
                            <p className="font-mono text-sm text-foreground break-all">{pedido.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Tipo de Compra</p>
                            <p className="text-sm text-foreground capitalize">{pedido.tipo_compra === "avulsa" ? "Compra Avulsa" : "Assinatura"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Método de Pagamento</p>
                            <p className="text-sm text-foreground capitalize">{pedido.metodo_pagamento}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Data de Criação</p>
                            <p className="text-sm text-foreground">{new Date(pedido.criado_em).toLocaleString("pt-BR")}</p>
                          </div>
                        </div>

                        {pedido.status_pagamento === "pago" && (
                          <div className="pt-4 border-t border-border">
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Recibo
                            </Button>
                          </div>
                        )}

                        {pedido.status_pagamento === "pendente" && (
                          <div className="pt-4 border-t border-border flex gap-2">
                            <Button size="sm" className="flex-1">
                              Pagar Agora
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            {!pedidosQuery.isLoading && pedidosQuery.data && pedidosQuery.data.length > 0 && (
                <div className="mt-6 text-center">
                    <Link href="/quiz">
                        <Button variant="outline">Descobrir Minha Box</Button>
                    </Link>
                </div>
            )
            }
          </div>
        )}

        {/* Assinaturas Tab */}
        {activeTab === "assinaturas" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Minhas Assinaturas</h2>
            {assinaturasQuery.isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Carregando assinaturas...</p>
              </Card>
            ) : assinaturasQuery.data?.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Você não possui assinaturas ativas</p>
                <Link href="/quiz">
                  <Button>Assinar uma Box</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assinaturasQuery.data?.map((assinatura: any) => (
                  <Card key={assinatura.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <button
                      onClick={() => setExpandedAssinatura(expandedAssinatura === assinatura.id ? null : assinatura.id)}
                      className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-5 h-5 text-accent" />
                            <p className="font-semibold text-foreground">Assinatura Mensal</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Próxima cobrança: {new Date(assinatura.proxima_cobranca).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <Check className="w-4 h-4" />
                            Ativa
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground ml-4 transition-transform ${expandedAssinatura === assinatura.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Detalhes Expandidos */}
                    {expandedAssinatura === assinatura.id && (
                      <div className="border-t border-border p-6 bg-muted/30 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">ID da Assinatura</p>
                            <p className="font-mono text-sm text-foreground break-all">{assinatura.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="text-sm text-foreground capitalize font-semibold text-green-600">Ativa</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Data de Início</p>
                            <p className="text-sm text-foreground">{new Date(assinatura.data_inicio).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Próxima Cobrança</p>
                            <p className="text-sm text-foreground font-semibold text-accent">{new Date(assinatura.proxima_cobranca).toLocaleDateString("pt-BR")}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="w-4 h-4 mr-2" />
                            Pausar Assinatura
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar Assinatura
                          </Button>
                        </div>

                        <div className="pt-4 border-t border-border bg-yellow-50 p-3 rounded-lg flex gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-800">
                            Ao cancelar, sua assinatura será encerrada ao final do período de cobrança atual.
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Perfil Tab */}
        {activeTab === "perfil" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Meus Dados</h2>
            <Card className="p-8 max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
                  <input
                    type="text"
                    defaultValue={user?.nome_completo || ""}
                    disabled
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    defaultValue={user?.telefone || ""}
                    disabled
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                  />
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Para editar seus dados, entre em contato com nosso suporte.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contatar Suporte
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "quiz" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Minhas Respostas do Quiz</h2>
            {quizQuery.isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Carregando perfil...</p>
              </Card>
            ) : !quizQuery.data ? (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não respondeu ao quiz</p>
                <Link href="/quiz">
                  <Button>Responder ao Quiz</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-6">
                {quizQuery.data.respostas_pessoais && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Informações Pessoais</h3>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(JSON.parse(quizQuery.data.respostas_pessoais as string), null, 2)}
                    </pre>
                  </Card>
                )}
                {quizQuery.data.respostas_emocionais && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Informações Emocionais</h3>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(JSON.parse(quizQuery.data.respostas_emocionais as string), null, 2)}
                    </pre>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === "admin" && user?.role === "admin" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Painel Admin</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/admin/produtos">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <Store className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Gerenciar Produtos</h3>
                  <p className="text-sm text-muted-foreground">Criar, editar e deletar caixas</p>
                </Card>
              </Link>
              <Link href="/admin/pedidos">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <ShoppingBag className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Gerenciar Pedidos</h3>
                  <p className="text-sm text-muted-foreground">Visualizar e atualizar status de pedidos</p>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
