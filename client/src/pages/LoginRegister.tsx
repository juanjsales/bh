import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Tab = "login" | "register";

export default function LoginRegister() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: (data) => {
      // O backend já define o cookie de sessão, mas se precisar do token explicitamente:
      // localStorage.setItem("authToken", data.token); // Exemplo se o backend retornasse o token
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const registerMutation = trpc.auth.registerLocal.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Redirecionando para o quiz...");
      navigate("/quiz");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ email, senha });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha || !nomeCompleto || !senhaConfirm) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (senha !== senhaConfirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    registerMutation.mutate({ email, senha, nome_completo: nomeCompleto });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Box & Health</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 pb-3 text-center font-medium transition-colors ${ tab === "login"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 pb-3 text-center font-medium transition-colors ${
                tab === "register"
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={loginMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/" className="text-accent hover:underline">
                  Voltar para home
                </Link>
              </div>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu Nome"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  disabled={registerMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={registerMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="senha-register">Senha</Label>
                <Input
                  id="senha-register"
                  type="password"
                  placeholder="••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={registerMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="senha-confirm">Confirmar Senha</Label>
                <Input
                  id="senha-confirm"
                  type="password"
                  placeholder="••••••"
                  value={senhaConfirm}
                  onChange={(e) => setSenhaConfirm(e.target.value)}
                  disabled={registerMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/" className="text-accent hover:underline">
                  Voltar para home
                </Link>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
