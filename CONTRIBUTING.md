# 🤝 Guia de Contribuição - Box & Health

Obrigado por querer contribuir para o Box & Health! Este guia ajudará você a entender como contribuir de forma eficaz.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Começar](#como-começar)
3. [Processo de Desenvolvimento](#processo-de-desenvolvimento)
4. [Padrões de Código](#padrões-de-código)
5. [Commits e PRs](#commits-e-prs)
6. [Testes](#testes)

## 📜 Código de Conduta

Todos os contribuidores devem seguir nosso código de conduta:

- Ser respeitoso com outros contribuidores
- Fornecer feedback construtivo
- Focar em o que é melhor para a comunidade
- Reportar comportamento inadequado aos mantainers

## 🚀 Como Começar

### 1. Fork e Clone

```bash
# Fork no GitHub
# Clonar seu fork
git clone https://github.com/seu-usuario/box-health.git
cd box-health

# Adicionar upstream
git remote add upstream https://github.com/original/box-health.git
```

### 2. Setup Local

```bash
pnpm install
pnpm dev
```

### 3. Criar Branch

```bash
# Atualizar main
git fetch upstream
git rebase upstream/main

# Criar branch
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

## 🔄 Processo de Desenvolvimento

### 1. Fazer Mudanças

```bash
# Editar arquivos
# Testar localmente
pnpm dev
pnpm test
```

### 2. Manter Código Limpo

```bash
# Formatar código
pnpm format

# Linting
pnpm lint

# Type checking
pnpm check
```

### 3. Adicionar Testes

```typescript
// Exemplo: server/features.test.ts
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Minha Feature", () => {
  it("deve fazer algo", async () => {
    // Arrange
    const dados = { /* ... */ };

    // Act
    const resultado = await appRouter.createCaller(ctx).feature.fazer(dados);

    // Assert
    expect(resultado).toBeDefined();
  });
});
```

### 4. Commit

```bash
# Staged changes
git add .

# Commit com mensagem descritiva
git commit -m "feat: adicionar nova feature"
```

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ Bom: Tipos explícitos
interface Usuario {
  id: number;
  nome: string;
  email: string;
}

const usuario: Usuario = { /* ... */ };

// ❌ Ruim: any
const usuario: any = { /* ... */ };
```

### Validação com Zod

```typescript
// ✅ Bom: Validação robusta
const schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  idade: z.number().positive(),
});

const dados = schema.parse(input);

// ❌ Ruim: Sem validação
const dados = input as Usuario;
```

### Tratamento de Erros

```typescript
// ✅ Bom: Mensagens seguras
try {
  const resultado = await db.query();
} catch (error) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erro ao processar solicitação',
  });
}

// ❌ Ruim: Expor stack trace
throw new Error(error.message);
```

### Componentes React

```typescript
// ✅ Bom: Componente tipado
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({ onClick, children, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ❌ Ruim: Props não tipadas
export function Button(props: any) {
  return <button {...props} />;
}
```

### Comentários

```typescript
// ✅ Bom: Comentários úteis
/**
 * Calcula a categoria recomendada baseada nas respostas
 * @param respostas - Respostas do usuário
 * @returns Categoria calculada
 */
function calcularCategoria(respostas: Record<string, number>): string {
  // Implementação
}

// ❌ Ruim: Comentários óbvios
// Incrementar i
i++;
```

## 📮 Commits e PRs

### Mensagens de Commit

Seguir o padrão Conventional Commits:

```
<tipo>(<escopo>): <descrição>

<corpo>

<rodapé>
```

**Tipos:**
- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (sem lógica)
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Dependências, build, etc

**Exemplos:**

```bash
git commit -m "feat(quiz): adicionar validação de respostas"
git commit -m "fix(pedidos): corrigir cálculo de desconto"
git commit -m "docs(readme): atualizar instruções de setup"
git commit -m "refactor(services): extrair lógica de negócio"
```

### Pull Requests

1. **Título claro**: `feat: adicionar sistema de cupons`
2. **Descrição**: Explicar o quê e por quê
3. **Checklist**:
   ```markdown
   - [ ] Testes adicionados/atualizados
   - [ ] Documentação atualizada
   - [ ] Sem breaking changes
   - [ ] Código formatado (pnpm format)
   ```

## 🧪 Testes

### Executar Testes

```bash
# Todos
pnpm test

# Específico
pnpm test quiz.test.ts

# Watch mode
pnpm test --watch

# Cobertura
pnpm test --coverage
```

### Cobertura Mínima

- **Funções críticas**: 100%
- **Serviços**: 80%+
- **Componentes**: 60%+
- **Utils**: 70%+

### Exemplo de Teste

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("OrderService", () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService();
  });

  describe("criarPedido", () => {
    it("deve criar pedido com dados válidos", async () => {
      const resultado = await service.criarPedido({
        produto_id: "123",
        valor_total: 100,
      });

      expect(resultado).toHaveProperty("id");
      expect(resultado.status).toBe("pendente");
    });

    it("deve rejeitar pedido com valor inválido", async () => {
      await expect(
        service.criarPedido({
          produto_id: "123",
          valor_total: -100,
        })
      ).rejects.toThrow("Valor deve ser positivo");
    });
  });
});
```

## 🔍 Checklist Antes de Submeter PR

- [ ] Código segue os padrões do projeto
- [ ] TypeScript sem erros (`pnpm check`)
- [ ] Testes passam (`pnpm test`)
- [ ] Código formatado (`pnpm format`)
- [ ] Sem console.log() em produção
- [ ] Documentação atualizada
- [ ] Commit messages descritivas
- [ ] Sem breaking changes (ou bem documentado)

## 🚨 Reportar Bugs

Use GitHub Issues com:

1. **Título claro**: Descrever o problema
2. **Reprodução**: Passos para reproduzir
3. **Comportamento esperado**: O que deveria acontecer
4. **Comportamento atual**: O que está acontecendo
5. **Screenshots**: Se aplicável
6. **Ambiente**: Node version, OS, browser

## 💡 Sugestões de Features

Abrir uma Issue com:

1. **Descrição**: Qual é a feature?
2. **Motivação**: Por que é útil?
3. **Exemplo**: Como seria usada?
4. **Alternativas**: Outras soluções consideradas?

## 📞 Dúvidas?

- Abrir uma Discussion no GitHub
- Contatar mantainers
- Consultar documentação

---

**Obrigado por contribuir! 🎉**
