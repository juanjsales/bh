import { Store, ShoppingBag, Heart, Users as UsersIcon, LayoutDashboard } from "lucide-react";

export const ADMIN_MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Store, label: "Produtos", path: "/admin/produtos" },
  { icon: ShoppingBag, label: "Pedidos", path: "/admin/pedidos" },
  { icon: UsersIcon, label: "Clientes", path: "/admin/clientes" },
  { icon: Heart, label: "Assinaturas", path: "/admin/assinaturas" },
];
