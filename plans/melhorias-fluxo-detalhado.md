### Plano de Implementação para Melhorias no Fluxo Box-Health

Este plano detalha as alterações necessárias no frontend e backend para implementar as funcionalidades solicitadas.

#### 1. Fluxo de pagamento: Garantir que o pedido fique em estado de processamento aguardando pagamento após a recomendação.

**Objetivo:** Modificar o processo de criação de pedido para que, ao ser gerado, ele tenha um status inicial de "pendente" (aguardando pagamento), e que isso seja refletido no frontend.

**Backend (`server/`):**

*   **Atualizar `server/services/orderService.ts`**:
    *   Modificar a função `criarPedido` para que, ao inserir um novo pedido na tabela `pedidos`, o campo `status_pagamento` seja explicitamente definido como `"pendente"`.
    *   **Exemplo de alteração:**
        ```typescript
        // ...
        await db.insert(pedidos).values({
          id: pedidoId,
          utilizador_id: utilizadorId,
          produto_id: input.produto_id,
          tipo_compra: input.tipo_compra,
          valor_total: input.valor_total.toString(),
          frete_valor: input.frete_valor?.toString(),
          metodo_pagamento: input.metodo_pagamento || "pix",
          status_pagamento: "pendente", // Adicionar esta linha
          endereco_rua: input.endereco?.rua,
          endereco_numero: input.endereco?.numero,
          endereco_complemento: input.endereco?.complemento,
          endereco_bairro: input.endereco?.bairro,
          endereco_cidade: input.endereco?.cidade,
          endereco_estado: input.endereco?.estado,
          endereco_cep: input.endereco?.cep,
        } as any);
        // ...
        ```
*   **Verificar `drizzle/schema.ts`**:
    *   Confirmar que o esquema da tabela `pedidos` permite o valor `"pendente"` para `status_pagamento` e que este campo tem um valor padrão apropriado (se necessário, embora a definição explícita em `criarPedido` seja preferível).

**Frontend (`client/`):**

*   **Atualizar `client/src/pages/PagamentoPix.tsx`**:
    *   Garantir que a página exiba corretamente o status "pendente" ao carregar os dados do pagamento PIX. (Com a mudança no backend, isso já deve funcionar, mas é bom verificar a UI).
    *   Considerar adicionar uma mensagem mais clara ao usuário informando que o pedido está "aguardando pagamento" e quais são os próximos passos.

#### 2. Fluxo de coleta de dados: Reorganizar a coleta de dados pessoais (Nome, Email, WhatsApp, Senha) para que ocorra antes da coleta do CEP e Endereço, evitando que o endereço seja solicitado novamente se já tiver sido coletado.

**Objetivo:** Reestruturar a ordem de coleta de dados no fluxo do quiz, garantindo que informações pessoais sejam coletadas uma única vez e antes do endereço.

**Frontend (`client/`):**

*   **Atualizar `client/src/pages/Quiz.tsx`**:
    *   **Inverter a ordem de exibição**: Atualmente, `CepInput` é exibido primeiro se `showCep` for `true`. A lógica precisará ser invertida para que o formulário de dados pessoais (`userDataForm`) apareça antes do `CepInput`.
    *   **Integração com `useAuth` e `quizStore`**:
        *   Ao carregar o formulário de dados pessoais, verificar se o usuário está autenticado (`isAuthenticated`).
        *   Se autenticado, pré-preencher `userDataForm` com `user.nome_completo` e `user.email` do `useAuth`.
        *   O campo `WhatsApp` deve ser solicitado se não estiver presente no perfil do usuário ou no `quizStore`.
        *   O campo `Senha` pode ser removido ou transformado em "Confirmar Senha" se o usuário já estiver logado. A criação de uma nova senha só seria necessária para novos usuários.
    *   **Lógica do `CepInput`**:
        *   Após a coleta dos dados pessoais (incluindo WhatsApp), o `CepInput` deve ser exibido.
        *   Verificar se o `quizStore.endereco.cep` já possui um valor. Se sim, pré-preencher o `CepInput` ou exibir o endereço já salvo e permitir edição, ou pular completamente essa etapa se o endereço estiver completo e o usuário não precisar alterá-lo.

**Backend (`server/`):**

*   **Revisar `server/services/quizService.ts`**:
    *   Garantir que a função `salvarRespostas` (chamada em `finalizarQuiz` em `Quiz.tsx`) esteja preparada para receber o WhatsApp como parte dos dados do cliente e lidar com a criação de usuário (se não autenticado) ou atualização (se autenticado) de forma idempotente.

#### 3. Opções de compra: Em todas as páginas de pagamento, ofertar tanto a opção de mensalidade (assinatura) quanto a opção avulsa.

**Objetivo:** Garantir que a escolha entre compra avulsa e assinatura seja clara e seja transmitida corretamente ao backend.

**Frontend (`client/`):**

*   **Atualizar `client/src/pages/Recommendation.tsx`**:
    *   Modificar os botões "Assinar Agora" e "Pagar Agora" para que, ao navegar para `/paywall`, eles passem a opção de compra (`"avulsa"` ou `"assinatura"`) via `quizStore` ou como um parâmetro de URL, para que o `Paywall.tsx` possa pré-selecionar a opção correta.
    *   **Exemplo (usando `quizStore`):**
        ```typescript
        // ... em Recommendation.tsx
        const handleAssinar = () => {
          quizStore.setTipoCompra("assinatura"); // Adicionar método ao quizStore
          setLocation("/paywall");
        };

        const handlePagarAvulso = () => {
          quizStore.setTipoCompra("avulsa"); // Adicionar método ao quizStore
          setLocation("/paywall");
        };
        // ...
        <Button onClick={handleAssinar} className="w-full">
          Assinar Agora
        </Button>
        <Button onClick={handlePagarAvulso} variant="outline" className="w-full">
          Pagar Agora
        </Button>
        ```
*   **Atualizar `client/src/pages/Paywall.tsx`**:
    *   Modificar o `useEffect` (linhas 46-65) para que, ao carregar a página, ele verifique se a `quizStore.tipo_compra` está definida. Se sim, use esse valor para inicializar o estado `tipoCompra` (linha 29). Se não, defina um padrão (e.g., `"avulsa"`).
    *   As opções de seleção de `tipoCompra` (botões na linha 202-233) já existem e devem permanecer.

**Backend (`server/`):**

*   Não são necessárias alterações no backend, pois `server/services/orderService.ts` já aceita `tipo_compra` na função `criarPedido`.

#### 4. Aba "Meus Pedidos": Se o cliente não tiver nenhum pedido, exibir apenas a mensagem de aviso e ocultar o botão de pedidos.

**Objetivo:** Ajustar a UI da aba "Meus Pedidos" para que o botão de "Descobrir Minha Box" seja ocultado quando não houver pedidos.

**Frontend (`client/`):**

*   **Atualizar `client/src/pages/Dashboard.tsx`**:
    *   Remover a renderização condicional do botão "Descobrir Minha Box" (linhas 160-162) dentro do bloco `pedidosQuery.data?.length === 0`.
    *   **Exemplo de alteração (remover):**
        ```typescript
        // ... em Dashboard.tsx
        ) : pedidosQuery.data?.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido</p>
            {/* Remover este bloco:
            <Link href="/quiz">
              <Button>Descobrir Minha Box</Button>
            </Link>
            */}
          </Card>
        ) : (
        // ...
        ```

---

**Diagrama de Fluxo (Mermaid):**

```mermaid
graph TD
    A[Início do Fluxo] --> B{Usuário Autenticado?};

    B -- Não --> C[Registro/Login];
    C --> D[Quiz: Coleta de Dados Pessoais];

    B -- Sim --> D;

    D --> E[Quiz: Coleta de WhatsApp];
    E --> F[Quiz: Coleta de CEP/Endereço];
    F --> G[Página de Recomendação];
    G --> H{Escolha de Compra};
    H -- Assinar Agora --> I[Paywall: Assinatura];
    H -- Pagar Agora --> J[Paywall: Compra Avulsa];

    I --> K[Criar Pedido (Backend) - Status: Pendente];
    J --> K;

    K --> L[Pagamento PIX (Frontend)];
    L --> M{Pagamento Confirmado?};
    M -- Sim --> N[Atualizar Pedido (Backend) - Status: Pago];
    M -- Não --> O[Pedido Cancelado/Expirado];

    G --> P[Dashboard: Meus Pedidos];
    P --> Q{Pedidos Existentes?};
    Q -- Não --> R[Exibir Mensagem de Aviso];
    Q -- Sim --> S[Exibir Lista de Pedidos];