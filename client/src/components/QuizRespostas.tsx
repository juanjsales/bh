import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuizRespostasProps {
  respostas: Record<string, any>;
  titulo: string;
}

const QuizRespostas: React.FC<QuizRespostasProps> = ({ respostas, titulo }) => {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg text-foreground mb-4">{titulo}</h3>
      <div className="space-y-4">
        {Object.entries(respostas).map(([pergunta, resposta]) => (
          <div key={pergunta} className="border-b border-border pb-2 last:border-b-0">
            <p className="text-sm font-medium text-muted-foreground">{pergunta}</p>
            <p className="text-base text-foreground mt-1">
              {Array.isArray(resposta) ? resposta.join(", ") : String(resposta)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default QuizRespostas;
