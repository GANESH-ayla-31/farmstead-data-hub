
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import HomePage from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import FarmlandsPage from "./pages/farmlands";
import NewFarmlandPage from "./pages/farmlands/new";
import CropsPage from "./pages/crops";
import NewCropPage from "./pages/crops/new";
import ProfilePage from "./pages/profile";
import CalendarPage from "./pages/calendar";
import ResourcesPage from "./pages/resources";
import WeatherPage from "./pages/weather";
import MarketPage from "./pages/market";
import SettingsPage from "./pages/settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Farmland Routes */}
            <Route path="/farmlands" element={<FarmlandsPage />} />
            <Route path="/farmlands/new" element={<NewFarmlandPage />} />
            
            {/* Crop Routes */}
            <Route path="/crops" element={<CropsPage />} />
            <Route path="/crops/new" element={<NewCropPage />} />
            
            {/* Calendar Route */}
            <Route path="/calendar" element={<CalendarPage />} />
            
            {/* New Routes */}
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Fallback routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
