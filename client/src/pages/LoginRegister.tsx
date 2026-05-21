import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function LoginRegister() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer login");
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Box & Health</h1>
          </div>

          <div className="flex gap-2 mb-8 border-b border-border">
            <div className="flex-1 pb-3 text-center font-medium text-accent border-b-2 border-accent">
              Login
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                autoComplete="email"
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
                name="current-password"
                autoComplete="current-password"
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
        </div>
      </Card>
    </div>
  );
}
