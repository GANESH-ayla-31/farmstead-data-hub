
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && isConfigured) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate, isConfigured]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {!isConfigured && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Supabase Configuration Missing</AlertTitle>
              <AlertDescription>
                Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
                <br />
                You can find these values in your Supabase project settings.
              </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
