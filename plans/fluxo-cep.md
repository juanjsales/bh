# Fluxo de Coleta de CEP no Quiz

O novo fluxo introduz uma etapa de validação de CEP antes do início das perguntas, garantindo que o usuário esteja em uma área atendida (ou apenas coletando o dado de localização) antes de prosseguir.

```mermaid
graph TD
    A[Início do Quiz] --> B{Possui CEP?}
    B -- Não --> C[Exibir Input de CEP]
    C --> D[Validar CEP via ViaCEP]
    D -- Válido --> E[Salvar no QuizStore]
    D -- Inválido --> F[Exibir Erro]
    F --> C
    E --> G[Iniciar Etapa 1 do Quiz]
    B -- Sim --> G
```

## Mudanças Planejadas

### 1. `client/src/stores/quizStore.ts`
* Adicionar novos campos ao estado: `cep`, `endereco` (objeto com logradouro, bairro, cidade, uf).
* Adicionar função `setEndereco(endereco: Endereco)`.

### 2. `client/src/pages/Quiz.tsx`
* Criar um estado `showCepInput` (ou transformar em uma etapa inicial).
* Integrar `fetch` com API `viacep.com.br/ws/{cep}/json/` para validar o CEP.
* Atualizar a lógica de renderização para exibir o input de CEP primeiro.
