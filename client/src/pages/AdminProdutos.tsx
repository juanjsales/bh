import { ADMIN_MENU_ITEMS } from "@/adminMenu";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

interface AssinaturaProdutoForm {
  assinaturaId: string;
  nomeAssinatura: string;
  precoEspecifico: string;
}

interface FormProduto {
  nome: string;
  descricao: string;
  categoria: string;
  preco_avulso: string;
  imagem_url: string;
  precos_assinatura_especificos: AssinaturaProdutoForm[];
}

const CATEGORIAS = [
  "Sono Profundo",
  "Energia Vital",
  "Calma Mental",
  "Beleza Natural",
  "Equilíbrio Corpo",
];

export default function AdminProdutos() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormProduto>({
    nome: "",
    descricao: "",
    categoria: "",
    preco_avulso: "",
    imagem_url: "",
    precos_assinatura_especificos: [],
  });

  const produtosQuery = trpc.produtos.listar.useQuery();
  const criarProdutoMutation = trpc.produtos.criar.useMutation();
  const atualizarProdutoMutation = trpc.produtos.atualizar.useMutation();
  const todasAssinaturasQuery = trpc.produtos.listarAssinaturas.useQuery();
  const deletarProdutoMutation = trpc.produtos.deletar.useMutation();

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

  const handlePrecoAssinaturaChange = (assinaturaId: string, nomeAssinatura: string, preco: string) => {
    setFormData(prevData => {
      const existingIndex = prevData.precos_assinatura_especificos.findIndex(p => p.assinaturaId === assinaturaId);
      if (existingIndex > -1) {
        const updatedPrecos = [...prevData.precos_assinatura_especificos];
        updatedPrecos[existingIndex] = { ...updatedPrecos[existingIndex], precoEspecifico: preco };
        return { ...prevData, precos_assinatura_especificos: updatedPrecos };
      } else {
        return {
          ...prevData,
          precos_assinatura_especificos: [
            ...prevData.precos_assinatura_especificos,
            { assinaturaId, nomeAssinatura, precoEspecifico: preco }
          ]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.categoria || !formData.preco_avulso) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await atualizarProdutoMutation.mutateAsync({
          id: editingId,
          ...formData,
          preco_avulso: parseFloat(formData.preco_avulso),
          precos_assinatura_especificos: formData.precos_assinatura_especificos.map(item => ({
            assinaturaId: item.assinaturaId,
            precoEspecifico: parseFloat(item.precoEspecifico),
          })),
        });
        toast.success("Produto atualizado com sucesso!");
      } else {
        await criarProdutoMutation.mutateAsync({
          ...formData,
          preco_avulso: parseFloat(formData.preco_avulso),
          precos_assinatura_especificos: formData.precos_assinatura_especificos.map(item => ({
            assinaturaId: item.assinaturaId,
            precoEspecifico: parseFloat(item.precoEspecifico),
          })),
        });
        toast.success("Produto criado com sucesso!");
      }

      setFormData({
        nome: "",
        descricao: "",
        categoria: "",
        preco_avulso: "",
        imagem_url: "",
        precos_assinatura_especificos: [],
      });
      setEditingId(null);
      setShowForm(false);
      produtosQuery.refetch();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleEdit = (produto: any) => {
    const precosAssinaturaExistente = (todasAssinaturasQuery.data || []).map(assinatura => {
      const precoEncontrado = produto.assinaturas?.find((pa: any) => pa.assinaturaId === assinatura.id);
      return {
        assinaturaId: assinatura.id,
        nomeAssinatura: assinatura.nome,
        precoEspecifico: precoEncontrado ? String(precoEncontrado.precoEspecifico) : "",
      };
    });

    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || "",
      categoria: produto.categoria || "",
      preco_avulso: String(produto.preco_avulso),
      imagem_url: produto.imagem_url || "",
      precos_assinatura_especificos: precosAssinaturaExistente,
    });
    setEditingId(produto.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deletarProdutoMutation.mutateAsync({ id });
        toast.success("Produto deletado com sucesso!");
        produtosQuery.refetch();
      } catch (error) {
        toast.error("Erro ao deletar produto");
      }
    }
  };

  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Produtos</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  nome: "",
                  descricao: "",
                  categoria: "",
                  preco_avulso: "",
                  preco_assinatura: "",
                  imagem_url: "",
                  precos_assinatura_especificos: [],
                });
              }}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Ex: Box Sono Profundo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preço Avulso (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco_avulso}
                  onChange={(e) => setFormData({ ...formData, preco_avulso: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="89.90"
                />
              </div>
            </div>

            {/* Campos de preços de assinatura específicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Preços de Planos de Assinatura</h3>
              {todasAssinaturasQuery.isLoading ? (
                <p className="text-muted-foreground">Carregando planos de assinatura...</p>
              ) : (todasAssinaturasQuery.data || []).map((assinatura) => (
                <div key={assinatura.id} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {assinatura.nome} (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precos_assinatura_especificos.find(p => p.assinaturaId === assinatura.id)?.precoEspecifico || ""}
                      onChange={(e) => handlePrecoAssinaturaChange(assinatura.id, assinatura.nome, e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
                placeholder="Descrição do produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.imagem_url}
                onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={criarProdutoMutation.isPending || atualizarProdutoMutation.isPending}>
                {editingId ? "Atualizar" : "Criar"} Produto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Produtos List */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Produtos ({produtosQuery.data?.length || 0})
        </h2>

        {produtosQuery.isLoading ? (
          <p className="text-muted-foreground">Carregando produtos...</p>
        ) : produtosQuery.data?.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
            <Button onClick={() => setShowForm(true)}>Criar Primeiro Produto</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {produtosQuery.data?.map((produto: any) => (
              <Card key={produto.id} className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-start">
                  {/* Imagem */}
                  <div className="md:col-span-1">
                    {produto.imagem_url ? (
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  {/* Detalhes */}
                  <div className="md:col-span-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{produto.nome}</h3>
                        <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {produto.descricao}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Avulsa:</span>
                        <p className="font-bold text-accent">R$ {produto.preco_avulso}</p>
                      </div>
                      {produto.preco_assinatura && (
                        <div>
                          <span className="text-muted-foreground">Assinatura:</span>
                          <p className="font-bold text-accent">R$ {produto.preco_assinatura}</p>
                        </div>
                      )}
                    </div>
                    {produto.assinaturas && produto.assinaturas.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Preços por Plano:</span>
                        <ul className="list-disc list-inside ml-2">
                          {produto.assinaturas.map((assinatura: any) => (
                            <li key={assinatura.assinaturaId}>
                              {assinatura.nomeAssinatura}: <span className="font-bold text-accent">R$ {assinatura.precoEspecifico}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="md:col-span-1 flex gap-2">
                    <button
                      onClick={() => handleEdit(produto)}
                      className="flex-1 p-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(produto.id)}
                      className="flex-1 p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Deletar</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
