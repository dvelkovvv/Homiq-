import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/spinner";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/home"));
const Step1 = lazy(() => import("./pages/evaluation/step1"));
const Step2 = lazy(() => import("./pages/evaluation/step2"));
const Step3 = lazy(() => import("./pages/evaluation/step3"));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/evaluation/step1" component={Step1} />
        <Route path="/evaluation/step2" component={Step2} />
        <Route path="/evaluation/step3" component={Step3} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingSpinner />}>
          <Router />
          <Toaster />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;