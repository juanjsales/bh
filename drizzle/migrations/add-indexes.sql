-- Índices para performance
-- Executar após criar as tabelas principais

-- Índices em pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_produto ON pedidos(produto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_criado ON pedidos(criado_em DESC);

-- Índices em assinaturas
CREATE INDEX IF NOT EXISTS idx_assinaturas_user ON assinaturas(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_produto ON assinaturas(produto_id);

-- Índices em perfis_quiz
CREATE INDEX IF NOT EXISTS idx_quiz_user ON perfis_quiz(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_quiz_categoria ON perfis_quiz(categoria_calculada);

-- Índices em carrinho
CREATE INDEX IF NOT EXISTS idx_carrinho_user ON carrinho(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_produto ON carrinho(produto_id);

-- Índices em utilizadores
CREATE INDEX IF NOT EXISTS idx_utilizadores_openid ON utilizadores(openId);
CREATE INDEX IF NOT EXISTS idx_utilizadores_email ON utilizadores(email);
CREATE INDEX IF NOT EXISTS idx_utilizadores_role ON utilizadores(role);

-- Índices em produtos
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
