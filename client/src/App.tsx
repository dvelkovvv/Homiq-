import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";

// Debug log
console.log('App component loading...');

function Router() {
  console.log('Router component loading...');
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/">
          <div className="p-4">Начална страница</div>
        </Route>
        <Route path="/evaluation/step1">
          <div className="p-4">Стъпка 1</div>
        </Route>
        <Route path="/evaluation/step2">
          <div className="p-4">Стъпка 2</div>
        </Route>
        <Route path="/evaluation/step3">
          <div className="p-4">Стъпка 3</div>
        </Route>
        <Route>
          <div className="p-4">404 - Страницата не е намерена</div>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  console.log('Main App rendering...');
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;