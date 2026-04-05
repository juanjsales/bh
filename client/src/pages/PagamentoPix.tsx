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

  const { data: pagamento, isLoading } = trpc.pix.obterPagamento.useQuery(
    { pagamento_id: pagamentoId },
    { enabled: !!pagamentoId }
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-kraft-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kraft-900 mb-2">Pagamento PIX</h1>
          <p className="text-kraft-600">Escaneie o QR Code ou copie a chave PIX</p>
        </div>

        {/* Card Principal */}
        <Card className={`border-2 ${statusClass[pagamento.status as keyof typeof statusClass]}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Valor a Pagar</CardTitle>
                <CardDescription>R$ {dados.valor}</CardDescription>
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
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="flex-1 border-kraft-300"
              >
                Voltar ao Dashboard
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-kraft-700 hover:bg-kraft-800"
              >
                Atualizar Status
              </Button>
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
