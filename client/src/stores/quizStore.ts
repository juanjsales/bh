import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface QuizResponse {
  pergunta_id: string;
  resposta: string | string[] | number;
  timestamp: number;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface UserData {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
}

export interface QuizState {
  // Estado do quiz
  quizId: string;
  respostas: QuizResponse[];
  endereco: Endereco | null;
  userData: UserData | null;
  tipo_compra: "avulsa" | "assinatura" | null;
  categoria_calculada: string | null;
  etapa_atual: number;
  total_etapas: number;
  
  // Ações
  iniciarQuiz: () => void;
  adicionarResposta: (pergunta_id: string, resposta: string | string[] | number) => void;
  setEndereco: (endereco: Endereco) => void;
  setUserData: (data: UserData) => void;
  setTipoCompra: (tipo: "avulsa" | "assinatura") => void;
  avancarEtapa: () => void;
  voltarEtapa: () => void;
  calcularCategoria: () => void;
  resetarQuiz: () => void;
  obterRespostasJson: () => Record<string, any>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizId: '',
  respostas: [],
  endereco: null,
  userData: null,
  tipo_compra: null,
  categoria_calculada: null,
  etapa_atual: 0,
  total_etapas: 5, // Ajustar conforme necessário
  
  iniciarQuiz: () => {
    set({
      quizId: uuidv4(),
      respostas: [],
      endereco: null,
      userData: null,
      tipo_compra: null,
      categoria_calculada: null,
      etapa_atual: 0,
    });
  },
  
  adicionarResposta: (pergunta_id: string, resposta: string | string[] | number) => {
    set((state) => {
      // Remover resposta anterior se existir
      const respostasAtualizadas = state.respostas.filter(r => r.pergunta_id !== pergunta_id);
      
      // Adicionar nova resposta
      respostasAtualizadas.push({
        pergunta_id,
        resposta,
        timestamp: Date.now(),
      });
      
      return { respostas: respostasAtualizadas };
    });
  },
  
  setEndereco: (endereco: Endereco) => {
    set({ endereco });
  },

  setUserData: (data: UserData) => {
    set({ userData: data });
  },

  setTipoCompra: (tipo: "avulsa" | "assinatura") => {
    set({ tipo_compra: tipo });
  },
  
  avancarEtapa: () => {
    set((state) => ({
      etapa_atual: Math.min(state.etapa_atual + 1, state.total_etapas - 1),
    }));
  },
  
  voltarEtapa: () => {
    set((state) => ({
      etapa_atual: Math.max(state.etapa_atual - 1, 0),
    }));
  },
  
  calcularCategoria: () => {
    const state = get();
    const respostasJson = state.obterRespostasJson();
    
    // Lógica simples de categorização baseada em palavras-chave
    let categoria = 'Bem-estar Geral';
    
    const respostasStr = JSON.stringify(respostasJson).toLowerCase();
    
    if (respostasStr.includes('foco') || respostasStr.includes('concentração')) {
      categoria = 'Foco';
    } else if (respostasStr.includes('relaxamento') || respostasStr.includes('estresse') || respostasStr.includes('ansiedade')) {
      categoria = 'Relaxamento';
    } else if (respostasStr.includes('energia') || respostasStr.includes('cansaço') || respostasStr.includes('fadiga')) {
      categoria = 'Energia';
    } else if (respostasStr.includes('sono') || respostasStr.includes('insônia')) {
      categoria = 'Sono';
    }
    
    set({ categoria_calculada: categoria });
  },
  
  resetarQuiz: () => {
    set({
      quizId: '',
      respostas: [],
      userData: null,
      categoria_calculada: null,
      etapa_atual: 0,
    });
  },
  
  obterRespostasJson: () => {
    const state = get();
    const respostasJson: Record<string, any> = {
      endereco: state.endereco,
      userData: state.userData,
    };
    
    state.respostas.forEach((resposta) => {
      respostasJson[resposta.pergunta_id] = resposta.resposta;
    });
    
    return respostasJson;
  },
}));
