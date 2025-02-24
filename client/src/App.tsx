import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Home from "@/pages/home";
import Step1 from "@/pages/evaluation/step1";
import Step2 from "@/pages/evaluation/step2";
import Step3 from "@/pages/evaluation/step3";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evaluation/step1" component={Step1} />
      <Route path="/evaluation/step2" component={Step2} />
      <Route path="/evaluation/step3" component={Step3} />
      <Route component={NotFound} />
    </Switch>
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
