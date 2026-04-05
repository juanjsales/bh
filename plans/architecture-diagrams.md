# Arquitetura do Projeto: Box & Health

Este documento apresenta a arquitetura de ponta a ponta do projeto Box & Health, utilizando diagramas Mermaid para facilitar a compreensão dos fluxos de dados e da organização do sistema.

## 1. Visão Geral do Sistema

O sistema é uma aplicação web full-stack para descoberta e compra de caixas de bem-estar personalizadas.

```mermaid
graph TD
    subgraph Frontend [Lado do Cliente - React]
        UI[Interface do Usuário]
        State[Gerenciamento de Estado - Zustand]
        tRPC_Client[Cliente tRPC]
    end

    subgraph Backend [Lado do Servidor - Node.js/Express]
        tRPC_Server[Servidor tRPC]
        Router[Roteadores da API]
        Services[Serviços de Negócio]
        Drizzle[Drizzle ORM]
    end

    subgraph External [Recursos Externos]
        DB[(MySQL Database)]
        S3[Amazon S3 - Imagens]
        OAuth[Provedores OAuth]
        Notif[Email/WhatsApp]
    end

    UI --> State
    UI --> tRPC_Client
    tRPC_Client -- "Requisições Type-Safe" --> tRPC_Server
    tRPC_Server --> Router
    Router --> Services
    Services --> Drizzle
    Drizzle -- "Consultas SQL" --> DB
    Services -- "Arquivos" --> S3
    Services -- "Envio" --> Notif
    Backend -- "Fluxo de Login" --> OAuth
```

## 2. Fluxo de Autenticação

O sistema suporta login local e autenticação externa.

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Cliente (React)
    participant S as Servidor (tRPC/Express)
    participant DB as Banco de Dados

    U->>C: Insere Credenciais
    C->>S: Mutação loginLocal(email, senha)
    S->>S: Hashear Senha (SHA-256)
    S->>DB: Consultar Usuário
    DB-->>S: Retorna Dados do Usuário
    S->>S: Validar Credenciais
    S->>S: Gerar Cookie de Sessão (Base64)
    S-->>C: Set-Cookie + Success: true
    C->>C: Atualizar Estado Global (useAuth)
```

## 3. Fluxo do Quiz e Recomendação

O núcleo da personalização da plataforma.

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Cliente (Zustand Store)
    participant S as Servidor (tRPC)
    participant DB as Banco de Dados

    U->>C: Responde Perguntas
    C->>C: Armazenar Resposta (adicionarResposta)
    U->>C: Finaliza Quiz
    C->>C: calcularCategoria (Heurística Local)
    C->>S: Mutação salvarRespostas(brutas, categoria)
    S->>DB: Inserir em perfis_quiz
    DB-->>S: Confirmação
    S-->>C: Perfil Salvo (ID)
    C->>U: Redirecionar para Paywall/Loja
```

## 4. Ciclo de Vida do Pedido

Rastreamento de transações e notificações.

```mermaid
graph LR
    P_Criado[Pedido Criado] --> P_Pendente[Status: Pendente]
    P_Pendente -- "Pagamento Realizado" --> P_Pago[Status: Pago]
    P_Pago -- "Processamento Admin" --> P_Enviado[Status: Enviado]
    P_Enviado -- "Confirmação Entrega" --> P_Entregue[Status: Entregue]
    
    P_Pendente -- "Cancelamento/Expiração" --> P_Cancelado[Status: Cancelado]

    subgraph Notificacoes [Sistema de Notificações]
        New_Order[Notificar Novo Pedido]
        Pay_Confirm[Notificar Pagamento]
        Ship_Update[Notificar Envio]
    end

    P_Criado -.-> New_Order
    P_Pago -.-> Pay_Confirm
    P_Enviado -.-> Ship_Update
```

Este diagrama representa a arquitetura de ponta a ponta do projeto Box & Health, integrando as camadas de frontend, backend e serviços externos.
