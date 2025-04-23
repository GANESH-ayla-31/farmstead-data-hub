
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Sprout, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Crop = {
  id: string;
  name: string;
  variety: string;
  growth_period_days: number;
  water_requirement: string;
  ideal_temperature: string;
  created_at: string;
};

const CropsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
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
          
          // If profile exists, fetch crops
          if (data) {
            fetchCrops();
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

    const fetchCrops = async () => {
      try {
        const { data, error } = await supabase
          .from('crops')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching crops data:', error);
          setError('Failed to load crops');
          return;
        }

        setCrops(data || []);
      } catch (err) {
        console.error('Error in crops fetch:', err);
        setError('Failed to load crops');
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
            <h1 className="text-2xl font-bold">Crops Database</h1>
            <p className="text-muted-foreground">Manage crop varieties for planting</p>
          </div>
          {hasProfile && (
            <Link to="/crops/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Crop
              </Button>
            </Link>
          )}
        </div>

        {checkingProfile ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2">Checking your profile...</span>
          </div>
        ) : !hasProfile ? (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Profile Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              You need to create a farmer profile before managing crops.
              <div className="mt-4">
                <Button onClick={handleCreateProfile} className="bg-green-600 hover:bg-green-700">
                  Create Your Profile
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2">Loading crops...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : crops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Sprout className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Crops Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't added any crops to the database yet.
              </p>
              <Link to="/crops/new">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Crop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <Card key={crop.id} className="overflow-hidden">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-lg">{crop.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Variety:</dt>
                      <dd>{crop.variety}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Growth Period:</dt>
                      <dd>{crop.growth_period_days} days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Water Need:</dt>
                      <dd>{crop.water_requirement}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Temperature:</dt>
                      <dd>{crop.ideal_temperature}</dd>
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

export default CropsPage;
