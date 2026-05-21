import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useQuizStore } from "@/stores/quizStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import CepInput from "@/components/CepInput";

interface QuizQuestion {
  id: string;
  etapa: number;
  pergunta: string;
  descricao?: string;
  tipo: "texto" | "multipla" | "escala";
  opcoes?: Array<{ label: string; icon?: any; value: string }>;
  escala?: { min: number; max: number; min_label: string; max_label: string };
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Etapa 2: Sono e Descanso
  {
    id: "qualidade_sono",
    etapa: 2,
    pergunta: "Como você avalia a qualidade do seu sono?",
    descricao: "Sua qualidade de sono é importante para o bem-estar",
    tipo: "escala",
    escala: { min: 1, max: 5, min_label: "Muito ruim", max_label: "Excelente" },
  },
  {
    id: "dificuldade_dormir",
    etapa: 2,
    pergunta: "Com que frequência você tem dificuldade para dormir?",
    tipo: "multipla",
    opcoes: [
      { label: "Raramente", value: "raramente" },
      { label: "Às vezes", value: "as_vezes" },
      { label: "Frequentemente", value: "frequentemente" },
      { label: "Sempre", value: "sempre" },
    ],
  },

  // Etapa 3: Estresse e Ansiedade
  {
    id: "nivel_estresse",
    etapa: 3,
    pergunta: "Qual é seu nível de estresse no dia a dia?",
    descricao: "Avalie como você se sente em relação ao estresse",
    tipo: "escala",
    escala: { min: 1, max: 5, min_label: "Muito baixo", max_label: "Muito alto" },
  },
  {
    id: "ansiedade",
    etapa: 3,
    pergunta: "Como você lida com ansiedade?",
    tipo: "multipla",
    opcoes: [
      { label: "Não tenho ansiedade", value: "nenhuma" },
      { label: "Controlo bem", value: "controlo" },
      { label: "Tenho dificuldade", value: "dificuldade" },
      { label: "Preciso de ajuda", value: "precisa_ajuda" },
    ],
  },

  // Etapa 4: Energia e Foco
  {
    id: "energia",
    etapa: 4,
    pergunta: "Qual é seu nível de energia durante o dia?",
    descricao: "Como você se sente em relação à sua disposição",
    tipo: "escala",
    escala: { min: 1, max: 5, min_label: "Muito cansado", max_label: "Muito energizado" },
  },
  {
    id: "concentracao",
    etapa: 4,
    pergunta: "Como está sua concentração e foco?",
    tipo: "multipla",
    opcoes: [
      { label: "Excelente", value: "excelente" },
      { label: "Bom", value: "bom" },
      { label: "Moderado", value: "moderado" },
      { label: "Precisa melhorar", value: "precisa_melhorar" },
    ],
  },

  // Etapa 5: Bem-estar Geral e Preferências
  {
    id: "bem_estar_geral",
    etapa: 5,
    pergunta: "Como você se sente em relação ao seu bem-estar geral?",
    tipo: "multipla",
    opcoes: [
      { label: "Muito bem", value: "muito_bem" },
      { label: "Bem", value: "bem" },
      { label: "Neutro", value: "neutro" },
      { label: "Poderia melhorar", value: "poderia_melhorar" },
    ],
  },
  {
    id: "preferencias",
    etapa: 5,
    pergunta: "Qual tipo de ritual você mais aprecia?",
    descricao: "Escolha o que mais te atrai para seu bem-estar",
    tipo: "multipla",
    opcoes: [
      { label: "Aromaterapia", value: "aromaterapia" },
      { label: "Chás e infusões", value: "cha" },
      { label: "Meditação", value: "meditacao" },
      { label: "Skincare natural", value: "skincare" },
    ],
  },
];



export default function Quiz() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const quizStore = useQuizStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string | string[] | number>>({});
  const [userDataForm, setUserDataForm] = useState({ nome: "", email: "", whatsapp: "", senha: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [etapaFluxo, setEtapaFluxo] = useState<"cadastro" | "cep" | "quiz">("cadastro");

  useEffect(() => {
    if (!isAuthenticated || !quizStore.quizId) {
      if (quizStore.quizId === "") { 
        quizStore.iniciarQuiz();
      }
    }

    if (isAuthenticated && user) {
      setUserDataForm({
        nome: user.nome_completo || "",
        email: user.email || "",
        whatsapp: (user as any).whatsapp || "",
        senha: "",
      });

      if (quizStore.endereco && etapaFluxo !== "quiz") {
        setEtapaFluxo("quiz");
      }
    }
  }, [isAuthenticated, user, quizStore.quizId, quizStore.endereco, etapaFluxo]);

  const salvarRespostasMutation = trpc.quiz.salvarRespostas.useMutation();

  const isFinalStep = currentQuestionIndex === QUIZ_QUESTIONS.length;
  const isQuizStep = etapaFluxo === "quiz" && !isFinalStep;
  const currentQuestion = isQuizStep ? QUIZ_QUESTIONS[currentQuestionIndex] : null;
  
  const etapaAtualDisplay = etapaFluxo === "cadastro" ? 1 : (etapaFluxo === "cep" ? 1 : quizStore.etapa_atual);
  
  const progresso = etapaFluxo === "cadastro" ? 0 : (etapaFluxo === "cep" ? 10 : (isFinalStep ? 100 : ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 90 + 10));

  const handleResposta = (valor: string | string[] | number) => {
    if (!currentQuestion) return;
    
    const novasRespostas = { ...respostas, [currentQuestion.id]: valor };
    setRespostas(novasRespostas);

    quizStore.adicionarResposta(currentQuestion.id, valor);

    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const finalizarQuiz = async () => {
    setIsLoading(true);
    try {
      const sono = respostas.qualidade_sono || 3;
      const estresse = respostas.nivel_estresse || 3;
      const energia = respostas.energia || 3;
      const preferencias = respostas.preferencias || "meditacao";

      let categoria = "calma";

      if (sono <= 2) {
        categoria = "sono";
      } else if (estresse >= 4) {
        categoria = "calma";
      } else if (energia <= 2) {
        categoria = "energia";
      } else if (preferencias === "skincare") {
        categoria = "beleza";
      } else if (preferencias === "cha") {
        categoria = "equilibrio";
      }

      await salvarRespostasMutation.mutateAsync({
        respostas_brutas: { ...respostas },
        categoria_calculada: categoria,
        cliente_nome: userDataForm.nome,
        cliente_email: userDataForm.email,
        cliente_whatsapp: userDataForm.whatsapp,
        cliente_cep: quizStore.endereco?.cep || "00000000",
        cliente_logradouro: quizStore.endereco?.logradouro || "N/A",
        cliente_numero: quizStore.endereco?.numero || "S/N",
        cliente_complemento: quizStore.endereco?.complemento || "",
        cliente_bairro: quizStore.endereco?.bairro || "N/A",
        cliente_cidade: quizStore.endereco?.cidade || "N/A",
        cliente_estado: quizStore.endereco?.uf || "XX",
        registro: isAuthenticated ? undefined : {
          email: userDataForm.email,
          senha: userDataForm.senha,
          nome_completo: userDataForm.nome,
        },
      });

      quizStore.setUserData(userDataForm);

      quizStore.calcularCategoria();
      setLocation("/recommendation");
    } catch (error) {
      console.error("Erro ao finalizar quiz:", error);
      toast.error("Erro ao processar suas respostas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Quiz Emocional</h1>
            <span className="text-sm text-muted-foreground">
              {etapaFluxo === "cadastro" || etapaFluxo === "cep" ? "Etapa 1 de 6" : isFinalStep ? "Finalização" : `Pergunta ${currentQuestionIndex + 1} de ${QUIZ_QUESTIONS.length}`}
            </span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>
      </header>

      <main className="container py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {etapaFluxo === "cadastro" ? (
             <Card className="p-8 mb-8 animate-fadeInUp">
               <div className="space-y-6">
                 <div className="mb-6">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 mb-3`}>
                      Dados Pessoais
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      Preencha seus dados
                    </h2>
                    <p className="text-muted-foreground">Preencha seus dados para começar o quiz.</p>
                 </div>
                 
                 <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setEtapaFluxo("cep");
                      }}
                      className="space-y-4"
                    >
                      <Input
                        placeholder="Nome completo"
                        value={userDataForm.nome}
                        onChange={(e) =>
                          setUserDataForm({ ...userDataForm, nome: e.target.value })
                        }
                        required
                      />
                      <Input
                        placeholder="Email"
                        value={userDataForm.email}
                        onChange={(e) =>
                          setUserDataForm({ ...userDataForm, email: e.target.value })
                        }
                        type="email"
                        required
                      />
                      <Input
                        placeholder="WhatsApp"
                        value={userDataForm.whatsapp}
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            whatsapp: e.target.value,
                          })
                        }
                        required
                      />
                      {!isAuthenticated && (
                        <Input
                          type="password"
                          placeholder="Senha"
                          value={userDataForm.senha}
                          onChange={(e) =>
                            setUserDataForm({ ...userDataForm, senha: e.target.value })
                          }
                          required
                        />
                      )}

                      <Button
                        type="submit"
                        disabled={
                          !userDataForm.nome ||
                          !userDataForm.email ||
                          !userDataForm.whatsapp ||
                          (!isAuthenticated && !userDataForm.senha)
                        }
                        className="w-full"
                      >
                        Continuar
                      </Button>
                    </form>
               </div>
             </Card>
          ) : etapaFluxo === "cep" ? (
            <CepInput onComplete={() => setEtapaFluxo("quiz")} />
          ) : (
            <>


              <Card className="p-8 mb-8 animate-fadeInUp">
                {isFinalStep ? (
                  <div className="space-y-6 text-center">
                    <h2 className="text-3xl font-bold text-foreground">Tudo pronto!</h2>
                    <p className="text-muted-foreground">Suas respostas foram registradas. Vamos gerar sua recomendação personalizada.</p>
                    <Button onClick={finalizarQuiz} disabled={isLoading} className="w-full">
                      {isLoading ? "Finalizando..." : "Ver Recomendação"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 mb-3`}>
                        Etapa {quizStore.etapa_atual} de 5
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {currentQuestion!.pergunta}
                      </h2>
                      {currentQuestion!.descricao && (
                        <p className="text-muted-foreground">{currentQuestion!.descricao}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {currentQuestion!.tipo === "texto" && (
                        <div className="space-y-4">
                          <Input
                            type="text"
                            placeholder="Digite sua resposta..."
                            value={(respostas[currentQuestion!.id] as string) || ""}
                            onChange={(e) => {
                              setRespostas({
                                ...respostas,
                                [currentQuestion!.id]: e.target.value,
                              });
                            }}
                            className="text-lg py-3"
                          />
                          <Button
                            onClick={() => handleResposta(respostas[currentQuestion!.id] as string)}
                            disabled={!respostas[currentQuestion!.id]}
                            className="w-full"
                          >
                            Continuar
                          </Button>
                        </div>
                      )}

                      {currentQuestion!.tipo === "multipla" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentQuestion!.opcoes?.map((opcao) => (
                            <button
                              key={opcao.value}
                              onClick={() => handleResposta(opcao.value)}
                              className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${
                                respostas[currentQuestion!.id] === opcao.value
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border hover:border-accent/50 text-foreground"
                              }`}
                            >
                              {opcao.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {currentQuestion!.tipo === "escala" && (
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{currentQuestion!.escala?.min_label}</span>
                            <span>{currentQuestion!.escala?.max_label}</span>
                          </div>
                          <div className="flex gap-3 justify-center">
                            {Array.from({
                              length: (currentQuestion!.escala?.max || 5) - (currentQuestion!.escala?.min || 1) + 1,
                            }).map((_, idx) => {
                              const valor = (currentQuestion!.escala?.min || 1) + idx;
                              return (
                                <button
                                  key={valor}
                                  onClick={() => handleResposta(valor)}
                                  className={`w-12 h-12 rounded-full font-bold transition-all ${
                                    respostas[currentQuestion!.id] === valor
                                      ? "bg-accent text-accent-foreground scale-110"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {valor}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card>

              {isQuizStep && (
                <div className="flex gap-4">
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
