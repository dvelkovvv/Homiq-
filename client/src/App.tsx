import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { VoiceCommands } from "@/components/voice-commands";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

import Home from "@/pages/home";
import Step1 from "@/pages/evaluation/step1";
import Step2 from "@/pages/evaluation/step2";
import Step3 from "@/pages/evaluation/step3";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Header() {
  return (
    <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-2">
          <VoiceCommands />
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/evaluation/step1" component={Step1} />
        <Route path="/evaluation/step2" component={Step2} />
        <Route path="/evaluation/step3" component={Step3} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;