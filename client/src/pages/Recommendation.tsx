import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/stores/quizStore";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";

export default function Recommendation() {
  const quizStore = useQuizStore();
  const [, setLocation] = useLocation();

  // Placeholder based on quiz result (from store)
  const categoria = quizStore.categoria_calculada || "Bem-estar Equilibrado";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-xl w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-accent" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sua Recomendação</h1>
          <p className="text-muted-foreground">
            Com base em suas respostas, montamos uma experiência única para você.
          </p>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Sua Box Recomendada:</p>
          <p className="text-2xl font-bold text-accent">{categoria}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => {
            quizStore.setTipoCompra("assinatura");
            setLocation("/paywall");
          }} className="w-full">
            Assinar Agora
          </Button>
          <Button onClick={() => {
            quizStore.setTipoCompra("avulsa");
            setLocation("/paywall");
          }} variant="outline" className="w-full">
            Pagar Agora
          </Button>
          <Button onClick={() => setLocation("/dashboard")} variant="ghost" className="w-full">
            Concluir Depois
          </Button>
        </div>
      </Card>
    </div>
  );
}
