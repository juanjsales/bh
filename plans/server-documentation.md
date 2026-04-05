## Documentação do Lado do Servidor

### `server/_core/index.ts`

Este é o ponto de entrada do servidor Express. Ele orquestra a configuração da API, autenticação e o serviço de arquivos estáticos.

**Principais Responsabilidades:**

*   **Inicialização do Express:** Configura o middleware para parsing de JSON e URL-encoded com limites de tamanho aumentados (50MB) para suportar uploads de arquivos.
*   **Roteamento tRPC:** Monta o `appRouter` no endpoint `/api/trpc` utilizando o adaptador para Express e injetando o contexto da requisição (`createContext`).
*   **Autenticação OAuth:** Registra rotas de callback para autenticação externa via `registerOAuthRoutes`.
*   **Integração com Vite (Desenvolvimento):** Em ambiente de desenvolvimento, utiliza o `setupVite` para habilitar HMR (Hot Module Replacement) e servir o frontend dinamicamente.
*   **Serviço de Arquivos Estáticos (Produção):** Em ambiente de produção, utiliza `serveStatic` para servir os arquivos compilados do frontend.
*   **Gerenciamento de Portas:** Tenta iniciar o servidor na porta definida em `process.env.PORT` (padrão 3000), mas possui uma lógica para encontrar automaticamente a próxima porta disponível caso a preferencial esteja ocupada.

### `server/routers.ts`

Este arquivo define a estrutura principal da API tRPC, organizando os endpoints em namespaces lógicos e definindo procedimentos públicos e protegidos.

**Módulos de API (Namespaces):**

*   **`auth`:**
    *   `me`: Retorna os dados do usuário atual do contexto.
    *   `loginLocal` / `registerLocal`: Gerencia autenticação baseada em email e senha, configurando cookies de sessão.
    *   `logout`: Limpa o cookie de sessão do usuário.
*   **`quiz`:**
    *   `salvarRespostas`: Armazena as respostas do questionário e a categoria calculada no banco de dados.
    *   `obterPerfil`: Recupera o perfil de bem-estar mais recente do usuário.
*   **`produtos`:** Endpoints para listagem, consulta individual e operações CRUD (restritas a administradores).
*   **`pedidos`:**
    *   `criar`: Registra um novo pedido e dispara notificações de sistema.
    *   `obterMeus`: Lista o histórico de compras do usuário autenticado.
    *   `obterTodos`: Visão global de pedidos para administradores.
    *   `atualizarStatus`: Permite alterar status de pagamento e envio, e adicionar rastreio (Admin).
*   **`assinaturas`:** Gerencia assinaturas recorrentes, permitindo criação, consulta e atualização de status (ativa/pausada/cancelada).
*   **`reviews`:** Sistema de avaliação de produtos com moderação administrativa.
*   **`email` / `whatsapp`:** Endpoints administrativos para disparar comunicações manuais ou automáticas e consultar histórico/estatísticas.
*   **`carrinho`:** Gerencia itens temporários de compra para usuários autenticados.
*   **`pix` / `system`:** Roteadores secundários importados para lidar com pagamentos e diagnósticos de sistema.

### `server/services/authService.ts`

Este serviço encapsula a lógica de negócio relacionada à autenticação local de usuários.

**Funcionalidades:**

*   **Hash de Senha:** Implementa `hashSenha` utilizando o algoritmo SHA-256 (via módulo `crypto` do Node.js) para armazenar senhas de forma segura.
*   **Login Local:**
    *   Valida as credenciais do usuário comparando o email e o hash da senha fornecida com os registros no banco de dados.
    *   Lança erros tRPC apropriados (`UNAUTHORIZED`) em caso de falha na autenticação ou indisponibilidade do banco.
*   **Registro Local:**
    *   Verifica a existência prévia do email para evitar duplicidade.
    *   Cria um novo registro na tabela `utilizadores` com a role padrão de "cliente" e a senha devidamente hasheada.

### Esquema do Banco de Dados (Drizzle ORM)

A aplicação utiliza o Drizzle ORM para gerenciar o banco de dados MySQL, com um esquema bem estruturado que reflete a lógica de negócio de e-commerce e bem-estar.

**Principais Tabelas:**

*   **`utilizadores`:** Gerencia a identidade, perfil (nome, email, telefone, endereço) e controle de acesso (RBAC com roles 'cliente' e 'admin').
*   **`perfis_quiz`:** Armazena o diagnóstico emocional dos usuários, incluindo as respostas brutas em JSON e a categoria final calculada.
*   **`produtos`:** Catálogo de caixas de bem-estar, com suporte a preços avulsos e assinaturas.
*   **`pedidos`:** O centro transacional da arquitetura. Rastreia o status de pagamento, status de envio e integrações com produtos e usuários.
*   **`assinaturas`:** Motor de recorrência que gerencia assinaturas ativas, pausadas ou canceladas, além de controlar a data da próxima cobrança.
*   **`carrinho`:** Gerenciamento de itens pré-compra persistidos para usuários autenticados.
*   **`pagamentos_pix`:** Controle detalhado de transações PIX, incluindo QR Codes e validação de comprovantes.
*   **`reviews`:** Sistema de avaliações de produtos (1-5 estrelas) com suporte a moderação administrativa.
*   **`email_logs` / `whatsapp_logs`:** Tabelas de auditoria que registram todas as comunicações enviadas aos clientes para fins de monitoramento e reenvio.

### `server/_core/context.ts`

Este arquivo define o contexto para todas as operações do tRPC, garantindo que informações essenciais estejam disponíveis para os roteadores.

**Funcionalidades:**

*   **Injeção de Contexto:** Fornece os objetos de requisição (`req`) e resposta (`res`) do Express para os roteadores tRPC.
*   **Autenticação Integrada:**
    *   Utiliza o `sdk.authenticateRequest` para tentar identificar o usuário logado a partir da requisição.
    *   Disponibiliza o objeto `user` (do tipo `Utilizador`) no contexto se a autenticação for bem-sucedida, ou `null` caso contrário.
    *   Permite que procedimentos protegidos (`protectedProcedure`) acessem as informações do usuário de forma direta e segura.

### Próximos Passos:

*   Concluir a documentação do servidor.
*   Iniciar a criação dos diagramas de arquitetura de ponta a ponta.




