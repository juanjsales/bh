import QuizRespostas from "@/components/QuizRespostas";
import { useState, useMemo, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { LogOut, ShoppingBag, Heart, Settings, Store, Calendar, AlertCircle, Check, Clock, X, Download, ChevronDown, LayoutDashboard, ShoppingCart, ArrowLeft, Plus, Minus, Trash2, Home, RefreshCw, Users as UsersIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

interface StatusBadgeProps {
  status: "pago" | "pendente" | "cancelado" | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClass = "";
  let icon = null;
  let text = "";

  switch (status) {
    case "pago":
      colorClass = "bg-green-100 text-green-800";
      icon = <Check className="w-4 h-4" />;
      text = "Pago";
      break;
    case "pendente":
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = <Clock className="w-4 h-4" />;
      text = "Pendente";
      break;
    case "cancelado":
      colorClass = "bg-red-100 text-red-800";
      icon = <X className="w-4 h-4" />;
      text = "Cancelado";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      text = "Desconhecido";
      break;
  }

  return (
    <Badge className={`inline-flex items-center gap-1 ${colorClass}`}>
      {icon}
      {text}
    </Badge>
  );
};


export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"loja" | "pedidos" | "assinaturas" | "perfil" | "quiz">("loja");
  const { items, adicionarItem, removerItem, incrementarQuantidade, decrementarQuantidade, getTotal } = useCartStore();
  const [tipoCompraSelecionado, setTipoCompraSelecionado] = useState<Record<string, { tipo: "avulsa" | "assinatura"; assinaturaId?: string; preco: number }>>({});

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
  };

  const menuItems = [
    { icon: Store, label: "Loja", path: "#loja", onClick: () => setActiveTab("loja") },
    { icon: ShoppingBag, label: "Meus Pedidos", path: "#pedidos", onClick: () => setActiveTab("pedidos") },
    { icon: Heart, label: "Assinaturas", path: "#assinaturas", onClick: () => setActiveTab("assinaturas") },
    { icon: Settings, label: "Meus Dados", path: "#perfil", onClick: () => setActiveTab("perfil") },
    { icon: Heart, label: "Meu Quiz", path: "#quiz", onClick: () => setActiveTab("quiz") },
  ];

  if (user?.role === "admin") {
    menuItems.push(
      { icon: Settings, label: "Administração", path: "/admin", onClick: () => window.location.href = "/admin" }
    );
  }
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);
  const [expandedAssinatura, setExpandedAssinatura] = useState<string | null>(null);

  const [nome, setNome] = useState(user?.nome_completo || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [cep, setCep] = useState(user?.enderecoCep || "");
  const [rua, setRua] = useState(user?.enderecoRua || "");
  const [numero, setNumero] = useState(user?.enderecoNumero || "");
  const [complemento, setComplemento] = useState(user?.enderecoComplemento || "");
  const [bairro, setBairro] = useState(user?.enderecoBairro || "");
  const [cidade, setCidade] = useState(user?.enderecoCidade || "");
  const [estado, setEstado] = useState(user?.enderecoEstado || "");

  useEffect(() => {
    if (user) {
      setNome(user.nomeCompleto || "");
      setTelefone(user.telefone || "");
      setCep(user.enderecoCep || "");
      setRua(user.enderecoRua || "");
      setNumero(user.enderecoNumero || "");
      setComplemento(user.enderecoComplemento || "");
      setBairro(user.enderecoBairro || "");
      setCidade(user.enderecoCidade || "");
      setEstado(user.enderecoEstado || "");
    }
  }, [user]);

  const pedidosQuery = trpc.pedidos.obterMeus.useQuery();
  const assinaturasQuery = trpc.assinaturas.obterMinhas.useQuery();
  const quizQuery = trpc.quiz.obterPerfil.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const produtosQuery = trpc.produtos.listar.useQuery();
  const adicionarAoCarrinhoMutation = trpc.carrinho.adicionar.useMutation();

  const atualizarPerfilMutation = trpc.auth.atualizarPerfil.useMutation();

  const handleAdicionarAoCarrinho = (produtoId: string) => {
    const selecao = tipoCompraSelecionado[produtoId] || { tipo: "avulsa", preco: 0, assinaturaId: undefined };
    
    // Encontrar o produto no cache da query para obter o preço
    const produto = produtosQuery.data?.find((p) => p.id === produtoId);
    if (!produto) return;

    const preco = selecao.tipo === "avulsa"
      ? parseFloat(produto.preco_avulso)
      : parseFloat(produto.preco_assinatura || produto.preco_avulso);

    adicionarAoCarrinhoMutation.mutate(
      { 
        produto_id: produtoId, 
        quantidade: 1, 
        tipo_compra: selecao.tipo,
        assinatura_id: selecao.assinaturaId 
      },
      {
        onSuccess: () => {
          adicionarItem({
            produto_id: produtoId,
            quantidade: 1,
            tipo_compra: selecao.tipo,
            assinaturaId: selecao.assinaturaId,
            preco: preco
          });

          toast.success("Produto adicionado ao carrinho!");
        },
        onError: (error) => {
          toast.error("Erro ao adicionar produto: " + error.message);
        },
      }
    );
  };

  const handleRemoverDoCarrinho = (produtoId: string, tipo: "avulsa" | "assinatura") => {
    removerItem(produtoId, tipo);
  };

  const totalCarrinho = getTotal();

  const handleSalvarPerfil = async () => {
    try {
      await atualizarPerfilMutation.mutateAsync({
        nome_completo: nome,
        telefone,
        enderecoCep: cep,
        enderecoRua: rua,
        enderecoNumero: numero,
        enderecoComplemento: complemento,
        enderecoBairro: bairro,
        enderecoCidade: cidade,
        enderecoEstado: estado,
      });
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar dados.");
    }
  };



  return (
    <DashboardLayout menuItems={menuItems}>
      {/* Content */}
      <main className="container py-8">
        {/* Loja Tab */}
        {activeTab === "loja" && (
          <div className="flex-1 h-full">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Loja Box & Health</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                    <ShoppingCart className="w-6 h-6 text-accent" />
                    {items.length > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                        {items.length}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Seu Carrinho</SheetTitle>
                    <SheetDescription>Confira seus produtos selecionados.</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Carrinho vazio</p>
                    ) : (
                      items.map((item) => {
                        const produto = produtosQuery.data?.find((p) => p.id === item.produto_id);
                        if (!produto) return null;

                        const selecao = tipoCompraSelecionado[item.produto_id] || { tipo: "avulsa", preco: 0 };
                        const preco = item.tipo_compra === "avulsa"
                          ? parseFloat(produto.preco_avulso)
                          : (selecao.preco || parseFloat(produto.preco_assinatura || produto.preco_avulso));

                        return (
                          <div key={`${item.produto_id}-${item.tipo_compra}`} className="bg-muted/30 border border-border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground line-clamp-1">{produto.nome}</p>
                                <Badge variant={item.tipo_compra === "avulsa" ? "secondary" : "default"} className="text-[10px] py-0 px-2 h-5 mt-1">
                                  {item.tipo_compra === "avulsa" ? "Avulsa" : "Assinatura"}
                                </Badge>
                              </div>
                              <button onClick={() => handleRemoverDoCarrinho(item.produto_id, item.tipo_compra)} className="p-1 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-background border rounded px-1">
                                <button onClick={() => {
                                    decrementarQuantidade(item.produto_id, item.tipo_compra);
                                  }} className="p-1 disabled:opacity-50" disabled={item.quantidade <= 1}>
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold w-6 text-center">{item.quantidade}</span>
                                  <button onClick={() => {
                                    incrementarQuantidade(item.produto_id, item.tipo_compra);
                                  }} className="p-1">
                                    <Plus className="w-3 h-3" />
                                  </button>
                              </div>
                              <p className="text-sm font-bold text-accent">R$ {(preco * item.quantidade).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {items.length > 0 && (
                    <SheetFooter className="border-t border-border pt-4">
                      <div className="flex justify-between mb-4 w-full">
                        <span className="font-bold text-foreground">Total:</span>
                        <span className="font-bold text-accent text-lg">R$ {totalCarrinho.toFixed(2)}</span>
                      </div>
                      <Button className="w-full" onClick={() => window.location.href = "/checkout"}>Ir para Checkout</Button>
                    </SheetFooter>
                  )}
                </SheetContent>
              </Sheet>
            </header>

            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-4">
                {produtosQuery.isLoading ? (
                  <p className="text-muted-foreground">Carregando produtos...</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {produtosQuery.data?.map((produto: any) => (
                      <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        <div className="p-4">
                          <div className="inline-block px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium mb-2">
                            {produto.categoria}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{produto.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {produto.descricao}
                          </p>
                          <div className="flex flex-col gap-2 mb-4">
                            <Button
                              variant={tipoCompraSelecionado[produto.id]?.tipo === "avulsa" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setTipoCompraSelecionado((prev) => ({
                                  ...prev,
                                  [produto.id]: { tipo: "avulsa", preco: parseFloat(produto.preco_avulso) },
                                }));
                              }}
                            >
                              Compra Avulsa - R$ {produto.preco_avulso}
                            </Button>
                            {produto.assinaturas?.map((ass: any) => (
                              <Button
                                key={ass.assinaturaId}
                                variant={
                                  tipoCompraSelecionado[produto.id]?.tipo === "assinatura" &&
                                  tipoCompraSelecionado[produto.id]?.assinaturaId === ass.assinaturaId
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => {
                                  setTipoCompraSelecionado((prev) => ({
                                    ...prev,
                                    [produto.id]: {
                                      tipo: "assinatura",
                                      assinaturaId: ass.assinaturaId,
                                      preco: parseFloat(ass.precoEspecifico),
                                    },
                                  }));
                                }}
                              >
                                Assinatura {ass.nomeAssinatura} - R$ {ass.precoEspecifico}
                              </Button>
                            ))}
                            {!produto.assinaturas?.length && produto.preco_assinatura && (
                              <Button
                                variant={tipoCompraSelecionado[produto.id]?.tipo === "assinatura" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setTipoCompraSelecionado((prev) => ({
                                    ...prev,
                                    [produto.id]: {
                                      tipo: "assinatura",
                                      preco: parseFloat(produto.preco_assinatura),
                                    },
                                  }));
                                }}
                              >
                                Assinatura - R$ {produto.preco_assinatura}
                              </Button>
                            )}
                          </div>
                          <Button
                            onClick={() => handleAdicionarAoCarrinho(produto.id)}
                            className="w-full"
                            size="sm"
                          >
                            Adicionar ao Carrinho
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Loja Tab */}
              {/* Removed old cart logic from layout */}
            </div>
          </div>
        )}
        
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
                            <div>
                                <p className="font-semibold text-foreground">Pedido #{pedido.id.slice(0, 8)}</p>
                                <p className="text-sm font-medium text-muted-foreground">{pedido.produtoNome || "Produto"}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-accent mb-2">
                            R$ {parseFloat(pedido.valorTotal).toFixed(2)}
                          </p>
                          <StatusBadge status={pedido.statusPagamento} />
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground ml-4 transition-transform ${expandedPedido === pedido.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                      {/* Detalhes Expandidos */}
                    {expandedPedido === pedido.id && (
                      <div className="border-t border-border p-6 bg-muted/30 space-y-6">
                        <div className="flex gap-4 items-start">
                          {pedido.produtoImagem ? (
                            <img src={pedido.produtoImagem} alt={pedido.produtoNome} className="w-20 h-20 object-cover rounded-lg" />
                          ) : (
                            <div className="w-20 h-20 bg-muted flex items-center justify-center rounded-lg text-muted-foreground text-[10px]">Sem imagem</div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{pedido.produtoNome}</h4>
                            <Badge variant="secondary" className="mb-2">{pedido.produtoCategoria}</Badge>
                            <p className="text-sm text-muted-foreground">{pedido.produtoDescricao}</p>
                          </div>
                        </div>

                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Endereço de Entrega</p>
                                <p className="text-sm text-foreground">{pedido.enderecoRua}, {pedido.enderecoNumero}</p>
                                {pedido.enderecoComplemento && <p className="text-sm text-foreground">{pedido.enderecoComplemento}</p>}
                                <p className="text-sm text-foreground">{pedido.enderecoBairro}, {pedido.enderecoCidade}/{pedido.enderecoEstado}</p>
                                <p className="text-sm text-foreground">CEP: {pedido.enderecoCep}</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">ID Completo</p>
                                    <p className="font-mono text-sm text-foreground break-all">{pedido.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Tipo de Compra</p>
                                    <p className="text-sm text-foreground capitalize">{pedido.tipoCompra === "avulsa" ? "Compra Avulsa" : "Assinatura"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Status de Envio</p>
                                <p className="text-sm text-foreground capitalize">{pedido.statusEnvio}</p>
                            </div>
                            {pedido.statusEnvio === 'enviado' && pedido.codigoRastreio && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Código de Rastreio</p>
                                    <p className="text-sm font-mono text-accent">{pedido.codigoRastreio}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Data de Criação</p>
                                <p className="text-sm text-foreground">{new Date(pedido.criadoEm).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>

                        {pedido.statusPagamento === "pago" && (
                          <div className="pt-4 border-t border-border">
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Recibo
                            </Button>
                          </div>
                        )}

                        {pedido.statusPagamento === "pendente" && (
                          <div className="pt-4 border-t border-border flex gap-2">
                            <Button size="sm" className="flex-1" onClick={() => window.location.href = `/pagamento-pix/${pedido.id}`}>
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
                <Link href="/loja">
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
                <Form onSubmit={handleSalvarPerfil}>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        name="cep"
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="rua">Logradouro</Label>
                          <Input
                            id="rua"
                            name="rua"
                            type="text"
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="numero">Número</Label>
                          <Input
                            id="numero"
                            name="numero"
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                          />
                        </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        name="complemento"
                        type="text"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="bairro">Bairro</Label>
                          <Input
                            id="bairro"
                            name="bairro"
                            type="text"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            name="cidade"
                            type="text"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="estado">Estado</Label>
                          <Input
                            id="estado"
                            name="estado"
                            type="text"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                          />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Button type="submit" disabled={atualizarPerfilMutation.isPending} className="w-full">
                        {atualizarPerfilMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  </div>
                </Form>
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
                  <QuizRespostas 
                    titulo="Informações Pessoais" 
                    respostas={typeof quizQuery.data.respostas_pessoais === 'string' ? JSON.parse(quizQuery.data.respostas_pessoais) : quizQuery.data.respostas_pessoais} 
                  />
                )}
                {quizQuery.data.respostas_emocionais && (
                  <QuizRespostas 
                    titulo="Informações Emocionais" 
                    respostas={typeof quizQuery.data.respostas_emocionais === 'string' ? JSON.parse(quizQuery.data.respostas_emocionais) : quizQuery.data.respostas_emocionais} 
                  />
                )}
                {/* Adicionando a renderização de respostasBrutas */}
                {quizQuery.data.respostasBrutas && (() => {
                  const brutos = typeof quizQuery.data.respostasBrutas === 'string' ? JSON.parse(quizQuery.data.respostasBrutas) : quizQuery.data.respostasBrutas;
                  const mapeamento: Record<string, { pergunta: string; formatar: (v: any) => string }> = {
                    qualidade_sono: { pergunta: "Qualidade do sono", formatar: (v) => ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"][v - 1] || v },
                    dificuldade_dormir: { pergunta: "Frequência de dificuldade para dormir", formatar: (v) => ({ raramente: "Raramente", as_vezes: "Às vezes", frequentemente: "Frequentemente", sempre: "Sempre" }[v] || v) },
                    nivel_estresse: { pergunta: "Nível de estresse", formatar: (v) => ["Muito baixo", "Baixo", "Médio", "Alto", "Muito alto"][v - 1] || v },
                    ansiedade: { pergunta: "Lidar com ansiedade", formatar: (v) => ({ nenhuma: "Não tenho", controlo: "Controlo bem", dificuldade: "Tenho dificuldade", precisa_ajuda: "Preciso de ajuda" }[v] || v) },
                    energia: { pergunta: "Nível de energia", formatar: (v) => ["Muito cansado", "Cansado", "Médio", "Energizado", "Muito energizado"][v - 1] || v },
                    concentracao: { pergunta: "Concentração e foco", formatar: (v) => ({ excelente: "Excelente", bom: "Bom", moderado: "Moderado", precisa_melhorar: "Precisa melhorar" }[v] || v) },
                    bem_estar_geral: { pergunta: "Bem-estar geral", formatar: (v) => ({ muito_bem: "Muito bem", bem: "Bem", neutro: "Neutro", poderia_melhorar: "Poderia melhorar" }[v] || v) },
                    preferencias: { pergunta: "Ritual preferido", formatar: (v) => ({ aromaterapia: "Aromaterapia", cha: "Chás e infusões", meditacao: "Meditação", skincare: "Skincare natural" }[v] || v) },
                  };

                  const respostasFormatadas = Object.entries(brutos).reduce((acc, [chave, valor]) => {
                    if (mapeamento[chave]) {
                      acc[mapeamento[chave].pergunta] = mapeamento[chave].formatar(valor);
                    } else {
                      acc[chave] = valor;
                    }
                    return acc;
                  }, {} as Record<string, any>);

                  return (
                    <QuizRespostas 
                      titulo="Detalhes do Quiz" 
                      respostas={respostasFormatadas} 
                    />
                  );
                })()}
                <div className="mt-8 pt-6 border-t border-border flex justify-center">
                  <Link href="/quiz">
                    <Button className="flex items-center gap-2 px-8">
                      <RefreshCw className="w-4 h-4" />
                      Refazer Quiz
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

  {/* Removed Admin Tab logic from Dashboard as it has been moved to AdminDashboard.tsx */}
      </main>
    </DashboardLayout>
  );
}
