# Box & Health - TODO

## Fase 1: Banco de Dados e Tipos
- [x] Definir schema Drizzle com 5 tabelas (utilizadores, perfis_quiz, produtos, pedidos, assinaturas)
- [x] Gerar migrations SQL e aplicar via webdev_execute_sql
- [x] Criar interfaces TypeScript para todos os tipos
- [x] Configurar RLS (Row Level Security) no Supabase

## Fase 2: Autenticação e Roteamento
- [x] Implementar autenticação Supabase com OAuth
- [x] Criar contexto Zustand para gerenciamento de estado global
- [x] Configurar roteamento com proteção de rotas (PublicStack vs PrivateStack)
- [x] Implementar hooks de autenticação (useAuth)

## Fase 3: Landing Page e Quiz
- [x] Criar Landing Page com apresentação das caixas
- [x] Implementar Quiz Emocional multi-etapas
- [x] Salvamento progressivo das respostas do quiz no banco
- [x] Integração com Zustand para armazenar respostas em memória
- [x] Quiz Interativo com progresso visual e indicadores de etapa
- [x] Perguntas com opções visuais (cards, escalas, texto)
- [x] Animações suaves entre perguntas
- [x] Recomendação final personalizada

## Fase 4: Recomendação e Paywall
- [x] Lógica de recomendação de produto baseada em respostas do quiz
- [x] Página de Paywall com detalhes do produto recomendado
- [x] Integração com PIX para geração de QR code
- [x] Fluxo de checkout com instruções via WhatsApp

## Fase 5: Dashboard do Cliente (Minha Conta)
- [x] Criar Dashboard com visualização de pedidos
- [x] Exibir status de assinatura
- [x] Página de edição de perfil (Meus Dados)
- [x] Integração com histórico de pedidos
- [x] Link para Loja no Dashboard
- [x] Cards expandidos para detalhes de pedidos
- [x] Cards expandidos para gerenciamento de assinaturas
- [x] Opções de pausar/cancelar assinatura
- [x] Download de recibo para pedidos pagos
- [x] Navegacao com abas sticky
- [x] Testes para Dashboard (6 testes passando)

## Fase 6: Backoffice Admin
- [x] Gestão de produtos (CRUD)
- [x] Gestão de pedidos (visualizar, atualizar status de pagamento)
- [x] Gestão de assinaturas (visualizar, pausar, cancelar)
- [x] Visualização de perfis de quiz dos clientes

## Fase 7: Loja e Carrinho
- [x] Criar catálogo de produtos para clientes logados
- [x] Implementar carrinho de compras
- [x] Upload e armazenamento de imagens no S3
- [x] Exibição de imagens no catálogo
- [x] Melhorias na Loja (navegacao, remover do carrinho com icone)

## Fase 10: Landing Page Melhorada
- [x] Adicionar imagens dos produtos na Landing Page
- [x] Criar cards de assinaturas com beneficios
- [x] Link para Loja no header da Landing Page
- [x] Integração de produtos com imagens CDN

## Fase 8: Notificações
- [x] Notificação ao proprietário quando novo pedido é criado
- [x] Notificação ao proprietário quando status de pagamento muda
- [x] Integração com sistema de notificações do Manus

## Fase 9: Testes e Entrega
- [ ] Testes unitários com Vitest
- [ ] Testes de integração
- [ ] Revisão final e ajustes
- [ ] Entrega ao usuário


## Fase 11: Revisão e Otimizações (Engenharia de Software)

### Segurança (P0 - Crítico)
- [x] Corrigir import COOKIE_NAME em routers.ts
- [x] Melhorar validações Zod (remover z.any())
- [ ] Implementar rate limiting com express-rate-limit
- [ ] Adicionar sanitização de entrada (xss package)
- [ ] Testar RLS policies no banco de dados
- [x] Melhorar tratamento de erros (não expor stack trace)

### Arquitetura (P1 - Importante)
- [ ] Dividir routers.ts em módulos (quiz, produtos, pedidos, assinaturas)
- [x] Criar camada de serviços (quizService, orderService, paymentService)
- [x] Implementar error handler centralizado
- [ ] Adicionar logging estruturado
- [ ] Refatorar procedures para usar serviços

### Banco de Dados (P1 - Importante)
- [x] Adicionar índices em utilizador_id, status_pagamento
- [ ] Adicionar foreign keys entre tabelas
- [ ] Adicionar soft deletes (campo deletado_em)
- [ ] Validar tipos de dados (preços como decimal)
- [x] Criar migration para melhorias

### Testes (P1 - Importante)
- [ ] Aumentar cobertura para 60%+
- [ ] Adicionar testes de validação de entrada
- [ ] Adicionar testes de acesso não autorizado
- [ ] Adicionar testes de rate limiting
- [ ] Adicionar testes e2e do fluxo completo

### Documentação (P2 - Desejável)
- [x] Criar README.md com setup e deployment
- [ ] Documentar API tRPC com exemplos
- [x] Adicionar comentários em código complexo
- [x] Criar guia de contribuição
- [x] Documentar variáveis de ambiente

### Performance (P2 - Desejável)
- [ ] Adicionar paginação em listagens
- [ ] Implementar caching de produtos
- [ ] Lazy load imagens na Landing Page
- [ ] Otimizar queries N+1
- [ ] Adicionar benchmarks

## Fase 12: Animações e UX Melhorada
- [x] Criar skeleton loading para produtos
- [x] Implementar shimmer effect
- [x] Adicionar transições suaves fade-in
- [x] Loading states em diferentes seções

## Fase 13: Login Independente e Banner Melhorado
- [x] Implementar autenticação local (email/senha)
- [x] Criar tabela de usuários com hash de senha
- [x] Página de login/registro
- [ ] Página de recuperação de senha
- [x] Mover imagem da caixa para o fundo do banner (integrada visualmente)


## Fase 14: PIX Manual Simulado
- [x] Criar tabela de pagamentos PIX
- [x] Implementar geração de QR Code PIX
- [x] Criar página de pagamento com instruções
- [x] Sistema de validação manual no admin
- [x] Sincronizar status de pedidos com pagamento
- [x] Notificações ao cliente quando pago
- [x] Testes para fluxo de pagamento PIX (3 testes passando)

## Fase 15: Melhorias - Sistema de Reviews
- [x] Criar tabela de reviews (id, utilizador_id, produto_id, rating, comentario, data)
- [x] Implementar procedures tRPC para criar/listar/deletar reviews
- [x] Implementar moderação de reviews (admin pode deletar)
- [x] Adicionar validação de reviews (usuário só pode comentar se comprou)
- [x] Serviço reviewService.ts com lógica completa
- [ ] Criar componente ReviewForm com 5 estrelas (frontend)
- [ ] Criar componente ReviewList com comentários (frontend)
- [ ] Adicionar reviews na página de detalhes do produto (frontend)

## Fase 16: Melhorias - Email Marketing
- [x] Criar tabela email_logs para rastrear emails
- [x] Criar templates de confirmação de pedido
- [x] Criar templates de status de entrega
- [x] Criar templates de recomendação personalizada
- [x] Implementar procedures tRPC para envio de emails
- [x] Serviço emailService.ts com lógica completa
- [x] Estatísticas de emails (enviados, falhas, bounces)
- [ ] Configurar integração com SendGrid ou Mailgun (produção)
- [ ] Implementar retry automático para emails falhados

## Fase 17: Melhorias - WhatsApp Business
- [x] Criar tabela whatsapp_logs para rastrear mensagens
- [x] Criar templates de mensagens (pagamento, entrega)
- [x] Implementar procedures tRPC para envio de mensagens
- [x] Validar formato de telefone (apenas Brasil)
- [x] Formatar telefone para padrão E.164
- [x] Serviço whatsappService.ts com lógica completa
- [x] Estatísticas de WhatsApp (enviados, entregues, lidos)
- [x] Testes para validação de telefone e geração de mensagens
- [ ] Configurar integração com WhatsApp Business API (produção)
- [ ] Implementar webhooks para receber status de mensagens
