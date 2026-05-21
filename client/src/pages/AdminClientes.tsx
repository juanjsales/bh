import { ADMIN_MENU_ITEMS } from "@/adminMenu";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Shield, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminClientes() {
  const { user } = useAuth();
  
  const clientesQuery = trpc.utilizadores.listar.useQuery();
  const atualizarRoleMutation = trpc.utilizadores.atualizarRole.useMutation({
    onSuccess: () => {
      toast.success("Papel do usuário atualizado com sucesso!");
      clientesQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao atualizar papel do usuário");
    }
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

  const handleRoleChange = (id: number, newRole: "cliente" | "admin") => {
    atualizarRoleMutation.mutate({ id, role: newRole });
  };

  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <h1 className="text-2xl font-bold text-foreground mb-8">Gerenciar Clientes</h1>

      <Card className="p-6">
        {clientesQuery.isLoading ? (
          <p>Carregando clientes...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Papel (Role)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesQuery.data?.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {cliente.nomeCompleto || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone || "N/A"}</TableCell>
                  <TableCell>{new Date(cliente.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={cliente.role}
                      onValueChange={(value: "cliente" | "admin") => handleRoleChange(cliente.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Cliente
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-accent" /> Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
