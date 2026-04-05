import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Heart,
  Lock,
  LogOut,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  X,
  Edit2,
  Save,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function Perfil() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);
  const [expandedAssinatura, setExpandedAssinatura] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome_completo: user?.nome_completo || "",
    email: user?.email || "",
    telefone: user?.telefone || "",
    endereco_completo: user?.endereco_completo || "",
  });

  const pedidosQuery = trpc.pedidos.obterMeus.useQuery();
  const assinaturasQuery = trpc.assinaturas.obterMinhas.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  // const atualizarPerfilMutation = trpc.usuarios.atualizar.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      toast.success("Desconectado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const handleSaveProfile = async () => {
    try {
      // await atualizarPerfilMutation.mutateAsync(formData);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
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
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAssinaturaStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-100 text-green-800";
      case "pausada":
        return "bg-yellow-100 text-yellow-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Você precisa estar logado para acessar seu perfil</p>
          <Link href="/login">
            <Button>Fazer Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">Meu Perfil</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Informações Pessoais */}
        <Card className="p-6 mb-6 border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="w-6 h-6" />
              Informações Pessoais
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Editar
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Nome Completo
              </label>
              {isEditing ? (
                <Input
                  value={formData.nome_completo}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_completo: e.target.value })
                  }
                  className="bg-card"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.nome_completo || "Não informado"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-card"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.email || "Não informado"}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Telefone
              </label>
              {isEditing ? (
                <Input
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  className="bg-card"
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.telefone || "Não informado"}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Endereço
              </label>
              {isEditing ? (
                <Input
                  value={formData.endereco_completo}
                  onChange={(e) =>
                    setFormData({ ...formData, endereco_completo: e.target.value })
                  }
                  className="bg-card"
                  placeholder="Rua, número, cidade"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.endereco_completo || "Não informado"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <Button
              onClick={handleSaveProfile}
              className="mt-6 gap-2"
              disabled={false}
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          )}
        </Card>

        {/* Histórico de Pedidos */}
        <Card className="p-6 mb-6 border-border">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
            <ShoppingBag className="w-6 h-6" />
            Histórico de Pedidos
          </h2>

          {pedidosQuery.isLoading ? (
            <p className="text-muted-foreground">Carregando pedidos...</p>
          ) : pedidosQuery.data && pedidosQuery.data.length > 0 ? (
            <div className="space-y-4">
              {pedidosQuery.data.map((pedido) => (
                <div
                  key={pedido.id}
                  className="border border-border rounded-lg p-4 hover:bg-card/50 transition-colors"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedPedido(
                        expandedPedido === pedido.id ? null : pedido.id
                      )
                    }
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Pedido #{pedido.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pedido.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(
                          pedido.status_pagamento
                        )}`}
                      >
                        {getStatusIcon(pedido.status_pagamento)}
                        {pedido.status_pagamento.charAt(0).toUpperCase() +
                          pedido.status_pagamento.slice(1)}
                      </span>
                      <p className="font-bold text-foreground">
                        R$ {(parseFloat(pedido.valor_total) / 100).toFixed(2)}
                      </p>
                      {expandedPedido === pedido.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {expandedPedido === pedido.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p className="font-medium text-foreground">
                            {pedido.tipo_compra === "avulsa"
                              ? "Compra Avulsa"
                              : "Assinatura"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium text-foreground">
                            {pedido.status_envio || "Não enviado"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Recibo
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Você ainda não tem pedidos. Comece a explorar nossas caixas!
            </p>
          )}
        </Card>

        {/* Gerenciamento de Assinaturas */}
        <Card className="p-6 mb-6 border-border">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6" />
            Minhas Assinaturas
          </h2>

          {assinaturasQuery.isLoading ? (
            <p className="text-muted-foreground">Carregando assinaturas...</p>
          ) : assinaturasQuery.data && assinaturasQuery.data.length > 0 ? (
            <div className="space-y-4">
              {assinaturasQuery.data.map((assinatura) => (
                <div
                  key={assinatura.id}
                  className="border border-border rounded-lg p-4 hover:bg-card/50 transition-colors"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedAssinatura(
                        expandedAssinatura === assinatura.id
                          ? null
                          : assinatura.id
                      )
                    }
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Assinatura #{assinatura.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Próxima renovação:{" "}
                        {new Date(assinatura.proxima_cobranca).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getAssinaturaStatusColor(
                          assinatura.status
                        )}`}
                      >
                        {assinatura.status.charAt(0).toUpperCase() +
                          assinatura.status.slice(1)}
                      </span>
                      <p className="font-bold text-foreground">
                        R$ 99,90/mês
                      </p>
                      {expandedAssinatura === assinatura.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {expandedAssinatura === assinatura.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium text-foreground">
                            {assinatura.status.charAt(0).toUpperCase() +
                              assinatura.status.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data de Início</p>
                          <p className="font-medium text-foreground">
                            {new Date(assinatura.criada_em).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {assinatura.status === "ativa" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              Pausar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {assinatura.status === "pausada" && (
                          <Button size="sm" className="flex-1">
                            Reativar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Você não tem assinaturas ativas. Escolha um plano para começar!
            </p>
          )}
        </Card>

        {/* Segurança */}
        <Card className="p-6 border-border">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6" />
            Segurança
          </h2>

          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Gerenciar Sessões
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Ativar Autenticação de Dois Fatores
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
