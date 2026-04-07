import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GraphView from "./pages/GraphView";
import Logout from "./pages/Logout";
import Account from "./pages/Account";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/login" component={Login} />
      <Route path="/logout" component={Logout} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/issuers" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/offerings" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/indices" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/documents" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/graph" component={() => <ProtectedRoute component={GraphView} />} />
      <Route path="/dashboard/account" component={() => <ProtectedRoute component={Account} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
