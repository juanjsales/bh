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

const ETAPAS = [
  { numero: 1, titulo: "Cadastro", cor: "from-blue-500 to-blue-600" },
  { numero: 2, titulo: "Sono e Descanso", cor: "from-purple-500 to-purple-600" },
  { numero: 3, titulo: "Estresse e Ansiedade", cor: "from-pink-500 to-pink-600" },
  { numero: 4, titulo: "Energia e Foco", cor: "from-yellow-500 to-yellow-600" },
  { numero: 5, titulo: "Bem-estar e Preferências", cor: "from-green-500 to-green-600" },
  { numero: 6, titulo: "Finalização", cor: "from-orange-500 to-orange-600" },
];

export default function Quiz() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const quizStore = useQuizStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [userDataForm, setUserDataForm] = useState({ nome: "", email: "", whatsapp: "", senha: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [etapaFluxo, setEtapaFluxo] = useState<"cadastro" | "cep" | "quiz">("cadastro");

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserDataForm({
        nome: user.nome_completo || "",
        email: user.email || "",
        whatsapp: (user as any).whatsapp || "",
        senha: "",
      });
      
      if (quizStore.endereco) {
        setEtapaFluxo("quiz");
      } else {
        setEtapaFluxo("cep");
      }
    } else {
      setEtapaFluxo("cadastro");
    }
  }, [isAuthenticated, user, quizStore.endereco]);

  const salvarRespostasMutation = trpc.quiz.salvarRespostas.useMutation();

  const isFinalStep = currentQuestionIndex === QUIZ_QUESTIONS.length;
  const isQuizStep = etapaFluxo === "quiz" && !isFinalStep;
  const currentQuestion = isQuizStep ? QUIZ_QUESTIONS[currentQuestionIndex] : null;
  
  const etapaAtual = isQuizStep ? currentQuestion!.etapa : (isFinalStep ? 6 : 1);
  const etapaInfo = ETAPAS[etapaAtual - 1];
  
  const questoesEtapa = isQuizStep ? QUIZ_QUESTIONS.filter((q) => q.etapa === etapaAtual) : [];
  const progresso = etapaFluxo === "cadastro" ? 0 : (etapaFluxo === "cep" ? 10 : (isFinalStep ? 100 : ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 90 + 10));

  useEffect(() => {
    console.log("Quiz acessado. Autenticado:", isAuthenticated);
  }, [isAuthenticated, setLocation]);

  const handleCepComplete = () => {
    setShowCep(false);
  };

  const handleResposta = async (valor: any) => {
    const novasRespostas = { ...respostas, [currentQuestion.id]: valor };
    setRespostas(novasRespostas);

    // Salvar no store
    quizStore.adicionarResposta(currentQuestion.id, valor);

    // Próxima etapa
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const finalizarQuiz = async () => {
    setIsLoading(true);
    try {
      // Calcular categoria baseado nas respostas
      const sono = respostas.qualidade_sono || 3;
      const estresse = respostas.nivel_estresse || 3;
      const energia = respostas.energia || 3;
      const preferencias = respostas.preferencias || "meditacao";

      let categoria = "calma";

      // Lógica de categorização
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

      // Salvar perfil no banco
      await salvarRespostasMutation.mutateAsync({
        respostas_brutas: { ...respostas },
        categoria_calculada: categoria,
        cliente_nome: userDataForm.nome,
        cliente_email: userDataForm.email,
        cliente_whatsapp: userDataForm.whatsapp,
        cliente_cep: quizStore.endereco?.cep || "",
        registro: isAuthenticated ? undefined : {
          email: userDataForm.email,
          senha: userDataForm.senha,
          nome_completo: userDataForm.nome,
        },
      });

      // Salvar userData no store
      quizStore.setUserData(userDataForm);

      // Redirecionar para recomendação
      quizStore.calcularCategoria();
      setLocation("/recommendation");
    } catch (error) {
      console.error("Erro ao finalizar quiz:", error);
      toast.error("Erro ao processar suas respostas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProxima = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnterior = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
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
                 
                 <div className="space-y-4">
                    <Input placeholder="Nome completo" value={userDataForm.nome} onChange={(e) => setUserDataForm({...userDataForm, nome: e.target.value})} />
                    <Input placeholder="Email" value={userDataForm.email} onChange={(e) => setUserDataForm({...userDataForm, email: e.target.value})} />
                    <Input placeholder="WhatsApp" value={userDataForm.whatsapp} onChange={(e) => setUserDataForm({...userDataForm, whatsapp: e.target.value})} />
                    {!isAuthenticated && (
                       <Input type="password" placeholder="Senha" value={userDataForm.senha} onChange={(e) => setUserDataForm({...userDataForm, senha: e.target.value})} />
                    )}
                    
                    <Button onClick={() => setEtapaFluxo("cep")} disabled={!userDataForm.nome || !userDataForm.email || !userDataForm.whatsapp || (!isAuthenticated && !userDataForm.senha)} className="w-full">
                      Continuar
                    </Button>
                 </div>
               </div>
             </Card>
          ) : etapaFluxo === "cep" ? (
            <CepInput onComplete={() => setEtapaFluxo("quiz")} />
          ) : (
            <>
              {/* Indicador de Etapa */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {ETAPAS.slice(1).map((etapa, idx) => (
                    <div key={etapa.numero} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 transition-all ${
                          etapa.numero <= etapaAtual + 1
                            ? `bg-gradient-to-r ${etapa.cor}`
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {etapa.numero}
                      </div>
                      <span className="text-xs text-center text-muted-foreground hidden md:block">
                        {etapa.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card da Pergunta ou Formulário */}
              <Card className="p-8 mb-8 animate-fadeInUp">
                {isFinalStep ? (
                  // Tela de Finalização
                  <div className="space-y-6 text-center">
                    <h2 className="text-3xl font-bold text-foreground">Tudo pronto!</h2>
                    <p className="text-muted-foreground">Suas respostas foram registradas. Vamos gerar sua recomendação personalizada.</p>
                    <Button onClick={finalizarQuiz} disabled={isLoading} className="w-full">
                      {isLoading ? "Finalizando..." : "Ver Recomendação"}
                    </Button>
                  </div>
                ) : (
                  // Card da Pergunta
                  <>
                    {/* ... (código existente da pergunta) ... */}
                    {/* Título da Etapa */}
                    <div className="mb-6">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${etapaInfo.cor} mb-3`}>
                        Etapa {etapaAtual} de 5
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {currentQuestion.pergunta}
                      </h2>
                      {currentQuestion.descricao && (
                        <p className="text-muted-foreground">{currentQuestion.descricao}</p>
                      )}
                    </div>

                    {/* Renderizar por tipo de pergunta */}
                    <div className="space-y-4">
                      {currentQuestion.tipo === "texto" && (
                        <div>
                          <Input
                            type="text"
                            placeholder="Digite sua resposta..."
                            value={respostas[currentQuestion.id] || ""}
                            onChange={(e) => {
                              setRespostas({
                                ...respostas,
                                [currentQuestion.id]: e.target.value,
                              });
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && respostas[currentQuestion.id]) {
                                handleResposta(respostas[currentQuestion.id]);
                              }
                            }}
                            className="text-lg py-3"
                          />
                          <Button
                            onClick={() => handleResposta(respostas[currentQuestion.id])}
                            disabled={!respostas[currentQuestion.id]}
                            className="w-full mt-4"
                          >
                            Continuar
                          </Button>
                        </div>
                      )}

                      {currentQuestion.tipo === "multipla" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentQuestion.opcoes?.map((opcao) => (
                            <button
                              key={opcao.value}
                              onClick={() => handleResposta(opcao.value)}
                              className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${
                                respostas[currentQuestion.id] === opcao.value
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border hover:border-accent/50 text-foreground"
                              }`}
                            >
                              {opcao.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {currentQuestion.tipo === "escala" && (
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>{currentQuestion.escala?.min_label}</span>
                            <span>{currentQuestion.escala?.max_label}</span>
                          </div>
                          <div className="flex gap-3 justify-center">
                            {Array.from({
                              length: (currentQuestion.escala?.max || 5) - (currentQuestion.escala?.min || 1) + 1,
                            }).map((_, idx) => {
                              const valor = (currentQuestion.escala?.min || 1) + idx;
                              return (
                                <button
                                  key={valor}
                                  onClick={() => handleResposta(valor)}
                                  className={`w-12 h-12 rounded-full font-bold transition-all ${
                                    respostas[currentQuestion.id] === valor
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

                    {/* Indicador de Pergunta na Etapa */}
                    <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
                      Pergunta {questoesEtapa.findIndex((q) => q.id === currentQuestion.id) + 1} de {questoesEtapa.length} nesta etapa
                    </div>
                  </>
                )}
              </Card>

              {/* Botões de Navegação */}
              {isQuizStep && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleAnterior}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    onClick={handleProxima}
                    disabled={!respostas[currentQuestion.id] || isLoading}
                    className="flex-1"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
