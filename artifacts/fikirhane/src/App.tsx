import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Home from '@/pages/Home';
import Brands from '@/pages/Brands';
import BrandDetail from '@/pages/BrandDetail';
import IdeaDetail from '@/pages/IdeaDetail';
import SubmitIdea from '@/pages/SubmitIdea';
import CreateBrand from '@/pages/CreateBrand';
import { Navbar } from '@/components/Navbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/brands" component={Brands} />
          <Route path="/brands/new" component={CreateBrand} />
          <Route path="/brands/:id" component={BrandDetail} />
          <Route path="/ideas/:id" component={IdeaDetail} />
          <Route path="/submit" component={SubmitIdea} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
