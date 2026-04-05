## Documentação do Lado do Cliente

### `client/src/main.tsx`

Este arquivo é o ponto de entrada da aplicação React e configura a infraestrutura principal do cliente.

**Principais Configurações:**

*   **Comunicação Cliente-Servidor (tRPC):**
    *   Utiliza `@trpc/client` com `httpBatchLink` para a comunicação com o backend tRPC em `/api/trpc`.
    *   `superjson` é usado como transformador para serialização/desserialização de dados complexos.
    *   As requisições incluem credenciais (`credentials: "include"`), indicando que cookies são usados para gerenciar sessões e autenticação.

*   **Gerenciamento de Estado de Query (React Query):**
    *   `@tanstack/react-query` é empregado para gerenciar o estado assíncrono, cache de dados e requisições no lado do cliente.
    *   Um `QueryClient` é instanciado e fornecido a toda a aplicação via `QueryClientProvider`.

*   **Tratamento Global de Erros de Autenticação:**
    *   A função `redirectToLoginIfUnauthorized` é registrada nos caches de query e mutation do React Query.
    *   Se um erro `TRPCClientError` com a mensagem `UNAUTHED_ERR_MSG` for detectado, o usuário é redirecionado para a URL de login (`getLoginUrl()`).

*   **Componente Raiz:**
    *   O componente principal da aplicação, `<App />`, é renderizado dentro dos provedores de tRPC e React Query, garantindo que todos os seus componentes filhos tenham acesso a essas funcionalidades.

### `client/src/App.tsx`

Este componente atua como o componente raiz da aplicação, definindo a estrutura de roteamento e os provedores de contexto globais.

**Principais Aspectos:**

*   **Roteamento (`wouter`):**
    *   A função `Router()` gerencia as rotas da aplicação usando a biblioteca `wouter`.
    *   Define mapeamentos entre URLs e componentes de página (ex: `/` para `Landing`, `/login` para `LoginRegister`, `/dashboard` para `Dashboard`, `/admin/produtos` para `AdminProdutos`, etc.).
    *   Inclui uma rota de fallback (`/404` e a rota final `component={NotFound}`) para lidar com caminhos não encontrados.

*   **Tratamento de Erros (`ErrorBoundary`):**
    *   O componente `<ErrorBoundary />` envolve toda a aplicação, fornecendo um mecanismo robusto para capturar e lidar com erros inesperados na interface do usuário, exibindo uma UI de fallback em vez de quebrar a aplicação.

*   **Provedor de Tema (`ThemeProvider`):**
    *   `ThemeProvider`, importado de `client/src/contexts/ThemeContext`, gerencia o tema visual da aplicação (atualmente com `defaultTheme="light"`). Há uma opção comentada `switchable` para habilitar a troca de tema.

*   **Componentes de UI Globais:**
    *   `TooltipProvider`: Fornece funcionalidade de tooltips em toda a aplicação.
    *   `Toaster`: Utilizado para exibir notificações e mensagens de toast ao usuário, proveniente de `@/components/ui/sonner`.

### `client/src/components/DashboardLayout.tsx`

Este componente define o layout principal do painel de controle da aplicação, incluindo navegação lateral, autenticação e responsividade.

**Principais Funcionalidades:**

*   **Controle de Acesso e Carregamento:**
    *   Utiliza o hook `useAuth` (`@/_core/hooks/useAuth`) para verificar o status de autenticação do usuário.
    *   Exibe um esqueleto de carregamento (`DashboardLayoutSkeleton`) enquanto o status de autenticação está sendo verificado.
    *   Redireciona usuários não autenticados para a página de login, apresentando uma UI amigável para isso.

*   **Barra Lateral de Navegação (`Sidebar`):**
    *   Implementa uma barra lateral expansível e colapsável, construída com componentes de UI personalizados (ex: `SidebarProvider`, `Sidebar`, `SidebarMenu`, `SidebarMenuButton`, etc.).
    *   Permite redimensionamento da largura da barra lateral, com a largura preferida persistida no `localStorage`.
    *   Os itens do menu são definidos programaticamente com ícones (`lucide-react`) e caminhos (`wouter`) para navegação.

*   **Experiência do Usuário (UX):**
    *   Exibe informações do usuário logado (avatar, nome, email) em um `DropdownMenu` no rodapé da barra lateral.
    *   Oferece uma opção de "Sign out" que chama a função `logout` do `useAuth`.
    *   Possui um cabeçalho adaptável para dispositivos móveis (`useIsMobile`), otimizando a experiência em telas menores.

### Próximos Passos:

### `client/src/components/ui/`

Este diretório contém uma extensa biblioteca de componentes de interface do usuário (UI) genéricos e reutilizáveis. Esses componentes são a base para a construção de toda a UI da aplicação, promovendo consistência visual e funcionalidade padronizada.

**Características Principais:**

*   **Base Radix UI e Tailwind CSS:** Muitos desses componentes são construídos sobre primitivos do Radix UI para acessibilidade e funcionalidade, e estilizados com Tailwind CSS para flexibilidade e personalização rápida.
*   **Consistência e Reusabilidade:** O objetivo deste diretório é fornecer um conjunto de componentes padronizados que podem ser usados em toda a aplicação, garantindo uma experiência de usuário coesa e reduzindo a duplicação de código.
*   **Exemplos de Componentes:** Inclui elementos básicos como `button.tsx`, `input.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, além de componentes mais complexos como `calendar.tsx`, `carousel.tsx`, `chart.tsx`, `table.tsx` e `sidebar.tsx` (já abordado em `DashboardLayout.tsx`).

### Próximos Passos:

### `client/src/_core/hooks/useAuth.ts`

Este hook centraliza a lógica de autenticação no lado do cliente, fornecendo acesso ao estado do usuário e funções relacionadas à autenticação.

**Funcionalidades:**

*   **Estado de Autenticação:** Expõe `user` (dados do usuário), `loading` (status de carregamento), `error` (erros de autenticação) e `isAuthenticated` (booleano indicando se o usuário está logado).
*   **Integração com tRPC:**
    *   Utiliza a query `trpc.auth.me.useQuery` para buscar dados do usuário autenticado do backend.
    *   Emprega a mutação `trpc.auth.logout.useMutation` para realizar a operação de logout, limpando o cache do usuário após o sucesso.
*   **Persistência de Dados do Usuário:** As informações do usuário são armazenadas no `localStorage` para reidratação do estado em carregamentos de página.
*   **Redirecionamento Pós-Autenticação/Desautenticação:** Oferece uma opção para redirecionar o usuário para uma `redirectPath` (padrão para a página de login) caso ele esteja desautenticado e a opção `redirectOnUnauthenticated` esteja ativada.
*   **Função `logout`:** Permite deslogar o usuário, invalidando o cache de autenticação do tRPC e redirecionando, se configurado.

### Próximos Passos:

### `client/src/hooks/useMobile.tsx`

Este hook fornece uma funcionalidade para detectar se o ambiente atual é considerado "móvel" com base na largura da janela do navegador.

**Funcionalidades:**

*   **Detecção de Breakpoint:** Define um `MOBILE_BREAKPOINT` (768px) e utiliza `window.matchMedia` para verificar se a largura da janela é menor que este breakpoint.
*   **Reatividade:** O hook escuta eventos de `change` no `matchMedia` e atualiza seu estado `isMobile` dinamicamente, garantindo que os componentes reajam a mudanças no tamanho da tela.
*   **Uso em Componentes:** Retorna um booleano que pode ser usado em componentes para renderizar layouts ou funcionalidades diferentes para dispositivos móveis e desktops.

### `client/src/pages/Landing.tsx`

Esta é a página inicial da aplicação (Landing Page), projetada para converter visitantes em clientes, apresentando a proposta de valor da Box & Health.

**Principais Seções e Funcionalidades:**

*   **Cabeçalho Dinâmico:** Adapta os botões de navegação conforme o status de autenticação do usuário (Login/Cadastro vs. Loja/Dashboard).
*   **Seção Hero:** Apresenta o título principal e uma chamada para ação (CTA) para realizar o "Quiz de Bem-estar".
*   **Vitrine de Produtos:**
    *   Consome a API tRPC (`trpc.produtos.listar.useQuery`) para exibir as 4 primeiras caixas de bem-estar.
    *   Inclui estados de carregamento com esqueletos (`ProductSkeletonGrid`).
    *   Exibe detalhes do produto como nome, descrição, categoria e preços (avulso e assinatura).
*   **Seção "Como Funciona":** Explica o processo de descoberta (Quiz), recomendação personalizada e o conceito de rituais botânicos.
*   **Planos de Assinatura:** Apresenta três modelos de negócio: Compra Avulsa, Assinatura Trimestral e Assinatura Mensal (destacada como a mais popular).
*   **Integração com Autenticação:** Todas as CTAs verificam se o usuário está autenticado para direcioná-lo corretamente (Login ou Quiz/Loja).

### `client/src/pages/Quiz.tsx`

Esta página implementa o "Quiz Emocional", uma funcionalidade interativa para identificar as necessidades de bem-estar do usuário e recomendar a caixa ideal.

**Funcionalidades e Fluxo:**

*   **Estrutura Multietapa:** O quiz é dividido em 5 etapas temáticas: Informações Pessoais, Sono e Descanso, Estresse e Ansiedade, Energia e Foco, e Bem-estar Geral.
*   **Tipos de Pergunta:** Suporta diferentes formatos de resposta, incluindo texto livre, múltipla escolha e escala numérica (1 a 5).
*   **Gerenciamento de Estado:**
    *   Utiliza um estado local para as respostas atuais e o índice da pergunta.
    *   Sincroniza as respostas com o `useQuizStore` (`@/stores/quizStore`) para persistência e cálculos futuros.
*   **Lógica de Categorização:** Ao finalizar o quiz, uma lógica heurística calcula uma "categoria ideal" (ex: "Sono Profundo", "Calma Mental", "Energia Vital") baseada nas respostas de sono, estresse e energia.
*   **Integração com Backend:**
    *   Envia as respostas brutas e a categoria calculada para o servidor via tRPC (`trpc.quiz.salvarRespostas.useMutation`).
    *   Após o salvamento bem-sucedido, redireciona o usuário para a página de `Paywall`.
*   **Interface do Usuário:** Inclui uma barra de progresso, indicadores visuais de etapa e animações para uma experiência fluida.

### `client/src/pages/Dashboard.tsx`

O Dashboard é o centro de controle do usuário autenticado, permitindo a gestão de suas interações com a plataforma.

**Funcionalidades e Abas:**

*   **Meus Pedidos:**
    *   Lista todos os pedidos realizados pelo usuário via `trpc.pedidos.obterMeus.useQuery`.
    *   Exibe status de pagamento dinâmicos (Pago, Pendente, Cancelado) com cores e ícones correspondentes.
    *   Permite expandir cada pedido para ver detalhes técnicos (ID, tipo de compra, método de pagamento).
*   **Minhas Assinaturas:**
    *   Gerencia as assinaturas ativas do usuário via `trpc.assinaturas.obterMinhas.useQuery`.
    *   Mostra informações sobre a próxima cobrança e status da assinatura.
    *   Oferece opções para pausar ou cancelar a assinatura (com avisos de retenção).
*   **Meus Dados (Perfil):** Exibe informações básicas do usuário como nome, email e telefone, com indicação de que alterações devem ser feitas via suporte.
*   **Painel Administrativo:** Se o usuário tiver a role `admin`, uma aba adicional é exibida com atalhos para gerenciar produtos e pedidos globais.
*   **Integração de Logout:** Botão dedicado que aciona a mutação de logout no tRPC e limpa o estado de autenticação local.

### Próximos Passos:

### `client/src/stores/quizStore.ts`

Este arquivo define um estado global centralizado usando `zustand` para gerenciar todo o fluxo do questionário de bem-estar.

**Responsabilidades:**

*   **Gerenciamento de Estado:** Mantém `quizId`, lista de `respostas` (com timestamp), `categoria_calculada`, `etapa_atual` e `total_etapas`.
*   **Ações de Controle:**
    *   `iniciarQuiz`, `resetarQuiz`: Controle do ciclo de vida do questionário.
    *   `adicionarResposta`: Adiciona ou atualiza uma resposta específica, garantindo consistência.
    *   `avancarEtapa`, `voltarEtapa`: Controle de navegação entre as etapas do quiz.
*   **Lógica de Processamento:**
    *   `calcularCategoria`: Implementa uma lógica heurística para inferir uma categoria de bem-estar (ex: Foco, Relaxamento, Energia, Sono) analisando as respostas coletadas.
    *   `obterRespostasJson`: Helper para transformar o array de objetos de resposta em um formato JSON simples (`Record<string, any>`), facilitando o envio para a API.

### Próximos Passos:

### `client/src/lib/trpc.ts`

Este arquivo configura o cliente tRPC para a aplicação React.

**Funcionalidades:**

*   **Tipagem Forte:** Cria o cliente tRPC usando `createTRPCReact<AppRouter>()`, onde `AppRouter` é importado do backend (`server/routers/index.ts`). Isso garante uma tipagem segura e autocompletar em toda a comunicação entre o cliente e o servidor.

### Próximos Passos:

*   Concluir a documentação do lado do cliente.
*   Iniciar a documentação dos módulos do lado do servidor (`server/`).

 
 
 



