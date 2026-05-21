import { ADMIN_MENU_ITEMS } from "@/adminMenu";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingBag, Store, Users as UsersIcon } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Painel Administrativo</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/admin/produtos">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Store className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Gerenciar Produtos</h3>
              <p className="text-sm text-muted-foreground">Criar, editar e deletar caixas</p>
            </Card>
          </Link>
          <Link href="/admin/pedidos">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <ShoppingBag className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Gerenciar Pedidos</h3>
              <p className="text-sm text-muted-foreground">Visualizar e atualizar status de pedidos</p>
            </Card>
          </Link>
          <Link href="/admin/clientes">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <UsersIcon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Gerenciar Clientes</h3>
              <p className="text-sm text-muted-foreground">Visualizar e gerenciar clientes</p>
            </Card>
          </Link>
          <Link href="/admin/assinaturas">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Heart className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Gerenciar Assinaturas</h3>
              <p className="text-sm text-muted-foreground">Visualizar e gerenciar assinaturas</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
