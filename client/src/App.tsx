import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import EditorIntegrated from "@/pages/editor-integrated";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login"; // ADD THIS IMPORT
import "./lib/i18n";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug logs
  console.log('🔧 [ROUTER] Auth state:', { 
    isAuthenticated, 
    isLoading, 
    user,
    hasToken: !!localStorage.getItem('token'),
    token: localStorage.getItem('token') ? 'Present' : 'Missing'
  });
  console.log('🔧 [ROUTER] Current URL:', window.location.href);

  // If still loading, show nothing or loading screen
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      {/* Public routes - accessible without authentication */}
      <Route path="/login">
        {(params) => {
          console.log('🔧 [ROUTER] Rendering Login page');
          return <Login />;
        }}
      </Route>
      
      {/* Protected routes - require authentication */}
      {isAuthenticated ? (
        <>
          <Route path="/">
            {(params) => {
              console.log('🔧 [ROUTER] Rendering EditorIntegrated page - User IS authenticated');
              return <EditorIntegrated />;
            }}
          </Route>
        </>
      ) : (
        <>
          <Route path="/">
            {(params) => {
              console.log('🔧 [ROUTER] Rendering Landing page - User NOT authenticated');
              return <Landing />;
            }}
          </Route>
        </>
      )}
      
      {/* Catch-all 404 */}
      <Route>
        {(params) => {
          console.log('🔧 [ROUTER] Rendering NotFound page - No route matched');
          return <NotFound />;
        }}
      </Route>
    </Switch>
  );
}

function App() {
  console.log('🔧 [APP] App component mounted');
  
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