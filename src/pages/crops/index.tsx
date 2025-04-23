import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Sprout, AlertTriangle, Loader2, Info, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Crop = {
  id: string;
  name: string;
  variety: string;
  growth_period_days: number;
  water_requirement: string;
  ideal_temperature: string;
  created_at: string;
  planting_depth?: string;
  spacing?: string;
  sun_exposure?: string;
  description?: string;
};

const CropsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  useEffect(() => {
    const checkFarmerProfile = async () => {
      if (!user || !isAuthenticated) {
        setCheckingProfile(false);
        return;
      }

      try {
        const localProfile = localStorage.getItem('farmtrack_profile');
        if (localProfile) {
          try {
            const parsedProfile = JSON.parse(localProfile);
            console.log("Found profile in localStorage:", parsedProfile);
            setHasProfile(true);
            
            const localCrops = localStorage.getItem('farmtrack_crops');
            if (localCrops) {
              setCrops(JSON.parse(localCrops));
            } else {
              const defaultCrops = getDefaultCrops();
              localStorage.setItem('farmtrack_crops', JSON.stringify(defaultCrops));
              setCrops(defaultCrops);
            }
            setLoading(false);
            setCheckingProfile(false);
            return;
          } catch (error) {
            console.error('Error parsing localStorage profile:', error);
          }
        }
        
        if (isSupabaseConfigured()) {
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
            setHasProfile(!!data);
            
            if (data) {
              fetchCrops();
            } else {
              setLoading(false);
            }
          }
        } else {
          setHasProfile(false);
          setLoading(false);
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
        if (isSupabaseConfigured()) {
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
        } else {
          const localCrops = localStorage.getItem('farmtrack_crops');
          if (localCrops) {
            setCrops(JSON.parse(localCrops));
          } else {
            const defaultCrops = getDefaultCrops();
            localStorage.setItem('farmtrack_crops', JSON.stringify(defaultCrops));
            setCrops(defaultCrops);
          }
        }
      } catch (err) {
        console.error('Error in crops fetch:', err);
        setError('Failed to load crops');
      } finally {
        setLoading(false);
      }
    };

    checkFarmerProfile();
  }, [user, isAuthenticated]);

  const getDefaultCrops = (): Crop[] => {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Corn',
        variety: 'Sweet Corn',
        growth_period_days: 70,
        water_requirement: 'Medium',
        ideal_temperature: '15-30°C',
        created_at: new Date().toISOString(),
        planting_depth: '2-3 inches',
        spacing: '9-12 inches',
        sun_exposure: 'Full sun',
        description: 'Sweet corn is a variety of maize with a high sugar content. Sweet corn is the result of a naturally occurring recessive mutation in the genes which control conversion of sugar to starch inside the endosperm of the corn kernel.'
      },
      {
        id: crypto.randomUUID(),
        name: 'Tomato',
        variety: 'Roma',
        growth_period_days: 80,
        water_requirement: 'Medium-High',
        ideal_temperature: '18-29°C',
        created_at: new Date().toISOString(),
        planting_depth: '1/4 inch',
        spacing: '24-36 inches',
        sun_exposure: 'Full sun',
        description: 'Roma tomatoes are a paste tomato cultivar. They have fewer seeds and are generally more dense than other tomato varieties, making them ideal for sauces and canning.'
      },
      {
        id: crypto.randomUUID(),
        name: 'Lettuce',
        variety: 'Romaine',
        growth_period_days: 45,
        water_requirement: 'High',
        ideal_temperature: '10-20°C',
        created_at: new Date().toISOString(),
        planting_depth: '1/4 inch',
        spacing: '6-8 inches',
        sun_exposure: 'Partial shade to full sun',
        description: 'Romaine lettuce is a variety of lettuce that grows in a tall head of sturdy dark green leaves with firm ribs down their centers. It has a robust flavor and is very nutritious.'
      }
    ];
  };
  
  const handleCreateProfile = () => {
    navigate('/profile');
    toast.info('Please create your profile first');
  };

  const viewCropDetails = (crop: Crop) => {
    setSelectedCrop(crop);
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
              <Card key={crop.id} className="overflow-hidden flex flex-col">
                <CardHeader className="bg-amber-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{crop.name}</CardTitle>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                      {crop.variety}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                  <dl className="space-y-2">
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
                <CardFooter className="pt-2 pb-4 flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => viewCropDetails(crop)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Sprout className="h-5 w-5 mr-2 text-amber-600" />
                          {selectedCrop?.name} - {selectedCrop?.variety}
                        </DialogTitle>
                        <DialogDescription>
                          Complete information about this crop variety
                        </DialogDescription>
                      </DialogHeader>
                      {selectedCrop && (
                        <div className="space-y-4 mt-4">
                          {selectedCrop.description && (
                            <div className="text-sm bg-amber-50 p-3 rounded-md">
                              <p className="italic">{selectedCrop.description}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500">Growth Period</h4>
                              <p>{selectedCrop.growth_period_days} days</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500">Water Requirement</h4>
                              <p>{selectedCrop.water_requirement}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500">Ideal Temperature</h4>
                              <p>{selectedCrop.ideal_temperature}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500">Sun Exposure</h4>
                              <p>{selectedCrop.sun_exposure || 'Not specified'}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500">Planting Depth</h4>
                              <p>{selectedCrop.planting_depth || 'Not specified'}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500">Plant Spacing</h4>
                              <p>{selectedCrop.spacing || 'Not specified'}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <Alert>
                              <Info className="h-4 w-4 text-blue-500" />
                              <AlertTitle className="text-blue-700">Planting Tip</AlertTitle>
                              <AlertDescription className="text-blue-600 text-sm">
                                {selectedCrop.name === 'Corn' 
                                  ? 'For best pollination, plant corn in blocks rather than single rows.'
                                  : selectedCrop.name === 'Tomato'
                                  ? 'Remove the bottom leaves and plant tomatoes deep - they\'ll develop roots along the buried stem.'
                                  : 'Consider succession planting every 2-3 weeks for a continuous harvest.'}
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CropsPage;
