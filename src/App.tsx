
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Hire } from "./pages/Hire";
import { Applications } from "./pages/Applications";
import { FAQ } from "./pages/FAQ";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hire" element={<Hire />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/index" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
