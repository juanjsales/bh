import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/stores/quizStore";
import { useLocation } from "wouter";
import { Sparkles, ShoppingCart, CheckCircle2, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Recommendation() {
  const quizStore = useQuizStore();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const criarPedidoMutation = trpc.pedidos.criar.useMutation();

  const { data: assinaturas } = trpc.produtos.listarAssinaturas.useQuery();
  const [selectedAssinaturaId, setSelectedAssinaturaId] = useState<string | null>(null);

  const categoria = quizStore.categoria_calculada || "Bem-estar Equilibrado";

  const handleComprar = async (tipo: "avulsa" | "assinatura") => {
    setIsLoading(true);
    try {
      if (tipo === "assinatura" && !selectedAssinaturaId) {
        toast.error("Por favor, selecione uma opção de assinatura.");
        setIsLoading(false);
        return;
      }

      quizStore.setTipoCompra(tipo);
      
      const result = await criarPedidoMutation.mutateAsync({
        produto_id: "categoria-" + categoria.toLowerCase().replace(/ /g, '-'),
        tipo_compra: tipo,
        assinatura_id: tipo === "assinatura" ? selectedAssinaturaId : undefined,
        valor_total: 99.90,
        endereco: quizStore.endereco ? {
            rua: quizStore.endereco.logradouro,
            numero: "0",
            bairro: quizStore.endereco.bairro,
            cidade: quizStore.endereco.cidade,
            estado: quizStore.endereco.uf,
            cep: quizStore.endereco.cep
        } : undefined
      });
      
      toast.success("Pedido criado com sucesso!");
      setLocation("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar pedido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-lg border-none">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Sua recomendação personalizada</CardTitle>
          <CardDescription className="text-lg">
            Analisamos suas preferências e selecionamos o plano ideal para seu estilo de vida.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 className="font-semibold text-lg">{categoria}</h3>
                <p className="text-sm text-slate-500">
                    Baseado em suas respostas ao quiz, este kit foca em promover mais equilíbrio, saúde mental e disposição no seu dia a dia.
                </p>
                <Badge className="mt-2" variant="secondary">Popular</Badge>
            </div>
          </div>

          {assinaturas && assinaturas.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">Selecione uma opção de assinatura:</h4>
              <RadioGroup onValueChange={setSelectedAssinaturaId} className="grid gap-2">
                {assinaturas.map((ass) => (
                  <div key={ass.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:border-primary/50 transition-colors">
                    <RadioGroupItem value={ass.id} id={ass.id} />
                    <Label htmlFor={ass.id} className="flex-1 cursor-pointer">
                      {ass.nome} - <span className="font-bold">{ass.duracaoMeses} meses</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={() => handleComprar("assinatura")} 
            disabled={isLoading} 
            className="w-full h-12 text-lg font-semibold"
          >
            {isLoading ? "Processando..." : (
                <>
                    Assinar Agora <ShoppingCart className="ml-2 w-5 h-5" />
                </>
            )}
          </Button>
          <Button 
            onClick={() => handleComprar("avulsa")} 
            disabled={isLoading} 
            variant="outline" 
            className="w-full h-12 text-lg"
          >
            {isLoading ? "Processando..." : "Comprar Apenas Este Kit"}
          </Button>
          <Button 
            onClick={() => setLocation("/dashboard")} 
            variant="ghost" 
            className="text-slate-500"
          >
            Ver mais detalhes depois <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
