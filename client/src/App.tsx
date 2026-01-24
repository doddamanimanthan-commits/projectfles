import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Watch from "@/pages/Watch";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Dynamic SEO titles based on current route
    const baseTitle = "Cine Streamer";
    if (location === "/") {
      document.title = `${baseTitle} - Home`;
    } else if (location.startsWith("/watch/")) {
      // Title will be updated by the Watch page once data loads
    } else if (location === "/login") {
      document.title = `${baseTitle} - Login`;
    } else if (location === "/admin") {
      document.title = `${baseTitle} - Admin Panel`;
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/watch/:id" component={Watch} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
