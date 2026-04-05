import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "@/pages/Landing";
import Quiz from "@/pages/Quiz";
import Paywall from "@/pages/Paywall";
import Dashboard from "@/pages/Dashboard";
import Loja from "@/pages/Loja";
import AdminProdutos from "@/pages/AdminProdutos";
import AdminPedidos from "@/pages/AdminPedidos";
import LoginRegister from "@/pages/LoginRegister";
import Home from "@/pages/Home";
import PagamentoPix from "@/pages/PagamentoPix";
import Perfil from "@/pages/Perfil";
import Recommendation from "@/pages/Recommendation";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/login"} component={LoginRegister} />
      <Route path={"/quiz"} component={Quiz} />
      <Route path={"/paywall"} component={Paywall} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/loja"} component={Loja} />
      <Route path={"/admin/produtos"} component={AdminProdutos} />
      <Route path={"/admin/pedidos"} component={AdminPedidos} />
      <Route path={"/pagamento-pix/:pagamentoId"} component={PagamentoPix} />
      <Route path={"/perfil"} component={Perfil} />
      <Route path={"/recommendation"} component={Recommendation} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
