import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";

import CampaignMatch from "./pages/CampaignMatch.tsx";
import BrandCampaigns from "./pages/BrandCampaigns.tsx";
import BrandProfile from "./pages/BrandProfile.tsx";
import InfluencerProfile from "./pages/InfluencerProfile.tsx";
import InfluencerPackages from "./pages/InfluencerPackages.tsx";
import InfluencerDashboardPage from "./pages/InfluencerDashboardPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/campaign-match" element={<ProtectedRoute><CampaignMatch /></ProtectedRoute>} />
          <Route path="/brand/campaigns" element={<ProtectedRoute><BrandCampaigns /></ProtectedRoute>} />
          <Route path="/brand/profile" element={<ProtectedRoute><BrandProfile /></ProtectedRoute>} />
          <Route path="/influencer/profile" element={<ProtectedRoute><InfluencerProfile /></ProtectedRoute>} />
          <Route path="/influencer/packages" element={<ProtectedRoute><InfluencerPackages /></ProtectedRoute>} />
          <Route path="/influencer/dashboard" element={<ProtectedRoute><InfluencerDashboardPage /></ProtectedRoute>} />
          <Route path="/influencer/*" element={<Navigate to="/influencer/dashboard" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
