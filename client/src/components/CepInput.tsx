import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuizStore, Endereco } from "@/stores/quizStore";
import { Card } from "@/components/ui/card";

export default function CepInput({ onComplete }: { onComplete: () => void }) {
  const [cep, setCep] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setEndereco = useQuizStore((state) => state.setEndereco);

  const handleBuscarCep = async () => {
    if (cep.length !== 8) {
      toast.error("CEP inválido");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setEndereco({
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      });
      onComplete();
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 mb-8 animate-fadeInUp">
      <h2 className="text-3xl font-bold text-foreground mb-6">Para começar, onde você mora?</h2>
      <p className="text-muted-foreground mb-6">Precisamos do seu CEP para personalizar sua experiência.</p>
      <div className="space-y-4">
        <Input
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
        />
        <Button
          onClick={handleBuscarCep}
          disabled={isLoading || cep.length !== 8}
          className="w-full"
        >
          {isLoading ? "Buscando..." : "Confirmar CEP"}
        </Button>
      </div>
    </Card>
  );
}
