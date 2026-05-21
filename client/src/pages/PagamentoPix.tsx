import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PagamentoPix() {
  const [, params] = useRoute("/pagamento-pix/:pagamentoId");
  const [, navigate] = useLocation();
  const pagamentoId = params?.pagamentoId as string;

  const [tempoRestante, setTempoRestante] = useState<number>(30 * 60); // 30 minutos
  const [copiado, setCopiado] = useState(false);

  const { mutate: confirmarPagamento, isLoading: isConfirmandoPagamento } = trpc.pix.confirmarPagamento.useMutation({
    onSuccess: () => {
      toast.success("Pagamento marcado como 'processando'. O admin validará em breve.");
      // Opcional: navegar ou recarregar para mostrar o status atualizado
      // navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(`Erro ao confirmar pagamento: ${error.message}`);
    },
  });

  const handleConfirmarPagamento = () => {
    confirmarPagamento({ pagamento_id: pagamentoId });
  };

  const { data: pagamento, isLoading, refetch } = trpc.pix.obterPagamento.useQuery(
    { pagamento_id: pagamentoId },
    { enabled: !!pagamentoId }
  );

  const { mutate: atualizarStatusPedido, isLoading: isAtualizandoStatus } = trpc.pedidos.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Pagamento confirmado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const handleConfirmarPagamentoReal = () => {
    if (pagamento?.pedidoId) {
      atualizarStatusPedido({
        pedido_id: pagamento.pedidoId,
        novo_status: "processando",
      });
    }
  };

  // Timer de expiracao
  useEffect(() => {
    if (!pagamento?.expira_em) return;

    const interval = setInterval(() => {
      const agora = new Date().getTime();
      const expira = new Date(pagamento.expira_em as Date).getTime();
      const diferenca = Math.floor((expira - agora) / 1000);

      if (diferenca <= 0) {
        setTempoRestante(0);
        clearInterval(interval);
      } else {
        setTempoRestante(diferenca);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pagamento?.expira_em]);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, "0")}`;
  };

  const copiarDados = () => {
    if (pagamento?.qr_code_base64) {
      const dados = pagamento.qr_code_base64 ? JSON.parse(pagamento.qr_code_base64) : { chave: "", valor: "0", descricao: "" };
      const texto = `Chave PIX: ${dados.chave}\nValor: R$ ${dados.valor}\nDescrição: ${dados.descricao}`;
      navigator.clipboard.writeText(texto);
      setCopiado(true);
      toast.success("Dados copiados!");
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!pagamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Pagamento não encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  const dados = pagamento.qr_code_base64 ? JSON.parse(pagamento.qr_code_base64) : { chave: "", valor: "0", descricao: "" };
  const expirado = tempoRestante <= 0;
  const statusClass = {
    pendente: "bg-yellow-50 border-yellow-200",
    confirmado: "bg-green-50 border-green-200",
    expirado: "bg-red-50 border-red-200",
    rejeitado: "bg-red-50 border-red-200",
  };

  const pedido = pagamento.pedido;
  const produto = pagamento.produto;

  // Calcula total com frete
  const valorProdutos = parseFloat(pagamento.valor);
  const valorFrete = pedido?.freteValor ? parseFloat(pedido.freteValor as string) : 0;
  const total = valorProdutos + valorFrete;

  return (
    <div className="min-h-screen bg-gradient-to-b from-kraft-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com dados do Pedido */}
        <div className="mb-8 p-6 bg-white rounded-xl border border-kraft-200 shadow-sm">
            <h1 className="text-2xl font-bold text-kraft-900">Pedido #{pagamento.pedidoId.slice(0, 8)}</h1>
            {produto && <p className="text-kraft-600 font-medium">{produto.nome}</p>}
            
            <div className="mt-4 text-sm text-kraft-600">
                <p>Produtos: <span className="font-semibold">R$ {valorProdutos.toFixed(2)}</span></p>
                <p>Frete: <span className="font-semibold">R$ {valorFrete.toFixed(2)}</span></p>
                <p className="text-lg font-bold text-kraft-900 mt-2">Total: R$ {total.toFixed(2)}</p>
            </div>
            
            {pedido?.enderecoRua && (
                <div className="mt-4 pt-4 border-t border-kraft-100 text-sm text-kraft-600">
                    <p className="font-semibold text-kraft-800">Endereço de entrega:</p>
                    <p>{pedido.enderecoRua}, {pedido.enderecoNumero} - {pedido.enderecoBairro}</p>
                    <p>{pedido.enderecoCidade}/{pedido.enderecoEstado} - CEP: {pedido.enderecoCep}</p>
                </div>
            )}
        </div>

        {/* Card Principal */}
        <Card className={`border-2 ${statusClass[pagamento.status as keyof typeof statusClass]}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pagamento PIX</CardTitle>
                <CardDescription>Escaneie o QR Code ou copie a chave PIX</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-kraft-600">Status</div>
                <div className="text-lg font-bold capitalize text-kraft-900">{pagamento.status}</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* QR Code Placeholder */}
            <div className="flex justify-center p-6 bg-white rounded-lg border border-kraft-200">
              <div className="w-64 h-64 bg-kraft-100 rounded flex items-center justify-center border-2 border-dashed border-kraft-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-kraft-600">QR Code PIX</p>
                  <p className="text-xs text-kraft-500 mt-1">Copie a chave abaixo</p>
                </div>
              </div>
            </div>

            {/* Dados PIX */}
            <div className="bg-kraft-50 p-4 rounded-lg border border-kraft-200 space-y-3">
              <div>
                <label className="text-sm font-medium text-kraft-700">Chave PIX</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-white p-2 rounded border border-kraft-300 text-sm font-mono text-kraft-900">
                    {dados.chave}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarDados}
                    className="border-kraft-300"
                  >
                    {copiado ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-kraft-700">Descrição</label>
                <p className="mt-1 text-sm text-kraft-600">{dados.descricao}</p>
              </div>
            </div>

            {/* Timer */}
            <Alert className={expirado ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {expirado ? (
                  <span className="text-red-800">
                    ⏰ Este QR Code expirou. Solicite um novo pagamento.
                  </span>
                ) : (
                  <span className="text-blue-800">
                    ⏰ Tempo restante: <strong>{formatarTempo(tempoRestante)}</strong>
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Instruções */}
            <div className="bg-kraft-50 p-4 rounded-lg border border-kraft-200">
              <h3 className="font-semibold text-kraft-900 mb-2">Como pagar:</h3>
              <ol className="space-y-2 text-sm text-kraft-700">
                <li>1. Abra seu app de banco ou carteira digital</li>
                <li>2. Selecione "Pagar com PIX" ou "Escanear QR Code"</li>
                <li>3. Escaneie o QR Code acima ou copie a chave PIX</li>
                <li>4. Confirme os dados e complete o pagamento</li>
                <li>5. Após confirmar, seu pedido será processado</li>
              </ol>
            </div>

            {/* Horário de Funcionamento */}
            <div className="bg-kraft-50 p-4 rounded-lg border border-kraft-200 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-kraft-800" />
                <h3 className="font-semibold text-kraft-800">Horário de Atendimento</h3>
              </div>
              <p className="text-sm text-kraft-700">Segunda a Sexta-feira: 09:00 - 18:00</p>
              <p className="text-sm text-kraft-700">Sábados: 09:00 - 13:00</p>
              <p className="text-sm text-kraft-700">Domingos e Feriados: Fechado</p>
            </div>

            {/* Status */}
            {pagamento.status === "confirmado" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Pagamento confirmado! Seu pedido está sendo preparado.
                </AlertDescription>
              </Alert>
            )}

            {pagamento.status === "rejeitado" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ❌ Pagamento rejeitado. Motivo: {pagamento.motivo_rejeicao || "Não especificado"}
                </AlertDescription>
              </Alert>
            )}

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-4">
              {pagamento.status === "pendente" && (
                <Button
                  onClick={handleConfirmarPagamentoReal}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                  disabled={isAtualizandoStatus || expirado}
                >
                  {isAtualizandoStatus ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  Já realizei o pagamento
                </Button>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="flex-1 border-kraft-300"
                >
                  Voltar ao Dashboard
                </Button>
                <Button
                  onClick={() => refetch()}
                  className="flex-1 bg-kraft-700 hover:bg-kraft-800"
                >
                  Atualizar Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nota */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>💡 Nota:</strong> Este é um sistema de pagamento manual. Após transferir via PIX, o admin
          validará seu pagamento. Você receberá uma notificação quando aprovado.
        </div>
      </div>
    </div>
  );
}
