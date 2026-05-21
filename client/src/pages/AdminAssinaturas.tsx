import { ADMIN_MENU_ITEMS } from "@/adminMenu";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Clock, Package, Pause, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminAssinaturas() {
  const { user } = useAuth();
  
  const assinaturasQuery = trpc.assinaturas.obterTodos.useQuery();
  const pausarMutation = trpc.assinaturas.pausar.useMutation({
    onSuccess: () => {
      toast.success("Assinatura pausada com sucesso!");
      assinaturasQuery.refetch();
    },
    onError: () => toast.error("Erro ao pausar assinatura"),
  });

  const cancelarMutation = trpc.assinaturas.cancelar.useMutation({
    onSuccess: () => {
      toast.success("Assinatura cancelada com sucesso!");
      assinaturasQuery.refetch();
    },
    onError: () => toast.error("Erro ao cancelar assinatura"),
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Acesso restrito a administradores</p>
          <Link href="/dashboard">
            <Button>Voltar para Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <h1 className="text-2xl font-bold text-foreground mb-8">Gerenciar Assinaturas</h1>

      <Card className="p-6">
        {assinaturasQuery.isLoading ? (
          <p>Carregando assinaturas...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plano (Produto)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Cobrança</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assinaturasQuery.data?.map((assinatura) => (
                <TableRow key={assinatura.id}>
                  <TableCell>{assinatura.clienteNome || "Desconhecido"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      {assinatura.produtoNome || "Produto indisponível"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={assinatura.status === 'ativa' ? 'default' : 'secondary'}>
                      {assinatura.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {new Date(assinatura.proximaCobranca).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {assinatura.status === 'ativa' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => pausarMutation.mutate({ assinatura_id: assinatura.id })}
                          disabled={pausarMutation.isPending}
                        >
                          <Pause className="w-4 h-4 mr-1" /> Pausar
                        </Button>
                      )}
                      {assinatura.status !== 'cancelada' && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => cancelarMutation.mutate({ assinatura_id: assinatura.id })}
                          disabled={cancelarMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
}
