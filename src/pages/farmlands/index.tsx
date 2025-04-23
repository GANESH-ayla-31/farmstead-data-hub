
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Tractor, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Farmland = {
  id: string;
  name: string;
  location: string;
  size_hectares: number;
  soil_type: string;
  created_at: string;
};

const FarmlandsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    // First check if the farmer profile exists
    const checkFarmerProfile = async () => {
      if (!user || !isAuthenticated || !isSupabaseConfigured()) {
        setCheckingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking farmer profile:', error);
          setError('Error checking farmer profile');
          setHasProfile(false);
        } else {
          // If data exists, the profile exists
          setHasProfile(!!data);
          
          // If profile exists, fetch farmlands
          if (data) {
            fetchFarmlands(data.id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error in profile check:', err);
        setError('Error checking your profile');
        setHasProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    const fetchFarmlands = async (farmerId: string) => {
      try {
        const { data, error } = await supabase
          .from('farmlands')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching farmer data:', error);
          setError('Failed to load farmlands');
          return;
        }

        setFarmlands(data || []);
      } catch (err) {
        console.error('Error in farmland fetch:', err);
        setError('Failed to load farmlands');
      } finally {
        setLoading(false);
      }
    };

    checkFarmerProfile();
  }, [user, isAuthenticated]);

  const handleCreateProfile = () => {
    navigate('/profile');
    toast.info('Please create your profile first');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Farmlands</h1>
            <p className="text-muted-foreground">Manage your farmland properties</p>
          </div>
          {hasProfile && (
            <Link to="/farmlands/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Farmland
              </Button>
            </Link>
          )}
        </div>

        {checkingProfile ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Checking your profile...</span>
          </div>
        ) : !hasProfile ? (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Profile Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              You need to create a farmer profile before managing farmlands.
              <div className="mt-4">
                <Button onClick={handleCreateProfile} className="bg-green-600 hover:bg-green-700">
                  Create Your Profile
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Loading farmlands...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : farmlands.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Tractor className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Farmlands Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't added any farmland properties to your account.
              </p>
              <Link to="/farmlands/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Farmland
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmlands.map((farmland) => (
              <Card key={farmland.id} className="overflow-hidden">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-lg">{farmland.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Location:</dt>
                      <dd>{farmland.location}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Size:</dt>
                      <dd>{farmland.size_hectares} hectares</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Soil Type:</dt>
                      <dd>{farmland.soil_type}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FarmlandsPage;
