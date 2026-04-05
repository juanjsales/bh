import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useQuizStore } from "@/stores/quizStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { MessageCircle, Check, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco_avulso: string;
  preco_assinatura: string | null;
  categoria: string | null;
  imagem_url: string | null;
}

export default function Paywall() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const quizStore = useQuizStore();
  const [produtoRecomendado, setProdutoRecomendado] = useState<Produto | null>(null);
  const [tipoCompra, setTipoCompra] = useState<"avulsa" | "assinatura">(quizStore.tipo_compra || "avulsa");
  const [pixKey, setPixKey] = useState<string>("");
  const [pedidoId, setPedidoId] = useState<string>("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enderecoRua, setEnderecoRua] = useState("");
  const [enderecoNumero, setEnderecoNumero] = useState("");
  const [enderecoComplemento, setEnderecoComplemento] = useState("");
  const [enderecoBairro, setEnderecoBairro] = useState("");
  const [enderecoCidade, setEnderecoCidade] = useState("");
  const [enderecoEstado, setEnderecoEstado] = useState("");
  const [enderecoCep, setEnderecoCep] = useState("");
  const [freteValor, setFreteValor] = useState(0);

  const produtosQuery = trpc.produtos.listar.useQuery();
  const criarPedidoMutation = trpc.pedidos.criar.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }

    if (!quizStore.categoria_calculada) {
      setLocation("/quiz");
      return;
    }

    // Buscar produto recomendado baseado na categoria
    if (produtosQuery.data) {
      const recomendado = produtosQuery.data.find(
        (p) => p.categoria?.toLowerCase() === quizStore.categoria_calculada?.toLowerCase()
      ) || produtosQuery.data[0];
      
      setProdutoRecomendado(recomendado);
    }
  }, [isAuthenticated, quizStore.categoria_calculada, produtosQuery.data]);

  const handleCriarPedido = async () => {
    if (!produtoRecomendado || !user) return;

    try {
      setIsLoading(true);
      const novoId = uuidv4();
      setPedidoId(novoId);

      const preco = tipoCompra === "avulsa" 
        ? parseFloat(produtoRecomendado.preco_avulso)
        : parseFloat(produtoRecomendado.preco_assinatura || produtoRecomendado.preco_avulso);

      await criarPedidoMutation.mutateAsync({
        produto_id: produtoRecomendado.id,
        tipo_compra: tipoCompra,
        valor_total: preco,
        frete_valor: freteValor,
        endereco: {
          rua: enderecoRua,
          numero: enderecoNumero,
          complemento: enderecoComplemento,
          bairro: enderecoBairro,
          cidade: enderecoCidade,
          estado: enderecoEstado,
          cep: enderecoCep,
        },
      });

      // Gerar chave PIX simulada (em produção, seria gerada por um serviço)
      const chavePixSimulada = `00020126580014br.gov.bcb.pix0136${novoId}520400005303986540510.005802BR5913BOX HEALTH6009SAO PAULO62410503***63041D3D`;
      setPixKey(chavePixSimulada);
      setShowQRCode(true);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!produtoRecomendado || !pedidoId) return;

    const mensagem = `Olá! Gostaria de confirmar meu pedido da Box & Health.\n\nPedido ID: ${pedidoId}\nProduto: ${produtoRecomendado.nome}\nValor: R$ ${tipoCompra === "avulsa" ? produtoRecomendado.preco_avulso : produtoRecomendado.preco_assinatura}\n\nEstou enviando o comprovante de pagamento PIX.`;
    
    const numeroWhatsApp = "5511999999999"; // Substituir pelo número real
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(urlWhatsApp, "_blank");
  };

  if (!produtoRecomendado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Carregando recomendação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-16">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/quiz">
            <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sua Box Recomendada
          </h1>
          <p className="text-muted-foreground">
            Baseado em suas respostas, selecionamos a box perfeita para você
          </p>
        </div>

        {/* Produto Card */}
        <Card className="p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Imagem */}
            <div className="flex items-center justify-center bg-card rounded-lg p-6 h-64">
              {produtoRecomendado.imagem_url ? (
                <img
                  src={produtoRecomendado.imagem_url}
                  alt={produtoRecomendado.nome}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Imagem não disponível</p>
                </div>
              )}
            </div>

            {/* Detalhes */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
                  {produtoRecomendado.categoria || "Bem-estar"}
                </div>
                
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {produtoRecomendado.nome}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {produtoRecomendado.descricao}
                </p>

                {/* Benefícios */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-accent" />
                    <span>Ingredientes 100% naturais</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-accent" />
                    <span>Rituals botânicos curados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-accent" />
                    <span>Entrega em até 5 dias úteis</span>
                  </div>
                </div>
              </div>

              {/* Preços */}
              <div className="space-y-4">
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Escolha seu modelo:</p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setTipoCompra("avulsa")}
                      className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                        tipoCompra === "avulsa"
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="font-semibold">Compra Avulsa</div>
                      <div className="text-2xl font-bold text-accent">
                        R$ {produtoRecomendado.preco_avulso}
                      </div>
                    </button>

                    {produtoRecomendado.preco_assinatura && (
                      <button
                        onClick={() => setTipoCompra("assinatura")}
                        className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                          tipoCompra === "assinatura"
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="font-semibold">Assinatura Mensal</div>
                        <div className="text-2xl font-bold text-accent">
                          R$ {produtoRecomendado.preco_assinatura}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          15% de desconto
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Informações de Entrega */}
                <div className="border-t border-border pt-4 mt-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Informações de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="rua">Rua</Label>
                      <Input id="rua" value={enderecoRua} onChange={(e) => setEnderecoRua(e.target.value)} placeholder="Nome da Rua" />
                    </div>
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input id="numero" value={enderecoNumero} onChange={(e) => setEnderecoNumero(e.target.value)} placeholder="Número" />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input id="complemento" value={enderecoComplemento} onChange={(e) => setEnderecoComplemento(e.target.value)} placeholder="Apto, Bloco, etc. (Opcional)" />
                    </div>
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" value={enderecoBairro} onChange={(e) => setEnderecoBairro(e.target.value)} placeholder="Bairro" />
                    </div>
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input id="cidade" value={enderecoCidade} onChange={(e) => setEnderecoCidade(e.target.value)} placeholder="Cidade" />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input id="estado" value={enderecoEstado} onChange={(e) => setEnderecoEstado(e.target.value)} placeholder="SP" maxLength={2} />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" value={enderecoCep} onChange={(e) => setEnderecoCep(e.target.value)} placeholder="00000-000" maxLength={10} />
                    </div>
                    <div>
                      <Label htmlFor="frete">Valor do Frete</Label>
                      <Input 
                        id="frete" 
                        type="number" 
                        value={freteValor} 
                        onChange={(e) => setFreteValor(parseFloat(e.target.value) || 0)} 
                        placeholder="0.00" 
                        step="0.01" 
                      />
                    </div>
                  </div>
                </div>

                {!showQRCode ? (
                  <Button
                    onClick={handleCriarPedido}
                    disabled={isLoading}
                    className="w-full text-lg py-6"
                  >
                    {isLoading ? "Processando..." : "Prosseguir para Pagamento"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnviarWhatsApp}
                    className="w-full text-lg py-6 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Enviar Comprovante via WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* QR Code Section */}
        {showQRCode && (
          <Card className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Pedido criado! Escaneie para Pagar
            </h3>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={pixKey} size={256} level="H" includeMargin={true} />
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-2">Ou copie a chave PIX:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded text-xs break-all">
                  {pixKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(pixKey)}
                  className="px-3 py-2 bg-accent text-accent-foreground rounded hover:opacity-90"
                >
                  Copiar
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Após realizar o pagamento, clique no botão abaixo para confirmar via WhatsApp
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
