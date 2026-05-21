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
  const [endereco, setLocalEndereco] = useState<Endereco | null>(null);

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

      setLocalEndereco({
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      });
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarEndereco = () => {
    if (endereco) {
        setEndereco(endereco);
        useQuizStore.getState().avancarEtapa();
        onComplete();
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
          {isLoading ? "Buscando..." : "Buscar Endereço"}
        </Button>
      </div>
      {endereco && (
        <div className="space-y-4 mt-6 pt-6 border-t">
          <h3 className="font-semibold text-lg">Confirme seu endereço</h3>
          <Input value={endereco.logradouro} onChange={(e) => setLocalEndereco({...endereco, logradouro: e.target.value})} placeholder="Logradouro" />
          <Input value={endereco.bairro} onChange={(e) => setLocalEndereco({...endereco, bairro: e.target.value})} placeholder="Bairro" />
          <Input value={endereco.cidade} onChange={(e) => setLocalEndereco({...endereco, cidade: e.target.value})} placeholder="Cidade" />
          <Input value={endereco.uf} onChange={(e) => setLocalEndereco({...endereco, uf: e.target.value})} placeholder="UF" />
          <Input value={endereco.numero || ""} onChange={(e) => setLocalEndereco({...endereco, numero: e.target.value})} placeholder="Número" />
          <Input value={endereco.complemento || ""} onChange={(e) => setLocalEndereco({...endereco, complemento: e.target.value})} placeholder="Complemento" />
          <Button onClick={handleConfirmarEndereco} className="w-full">Confirmar Endereço</Button>
        </div>
      )}
    </Card>
  );
}
