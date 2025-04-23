
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sprout, Plus, Search, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  type: string;
  growing_season: string;
  days_to_harvest: number;
  created_at: string;
}

const CropsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      if (!user || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setError("Supabase connection is not properly configured.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // For demonstration purposes, we'll use mock data
        // In a real app, you would fetch from Supabase
        const mockCrops: Crop[] = [
          {
            id: '1',
            name: 'Corn',
            type: 'Grain',
            growing_season: 'Summer',
            days_to_harvest: 80,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Tomatoes',
            type: 'Vegetable',
            growing_season: 'Summer',
            days_to_harvest: 60,
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Wheat',
            type: 'Grain',
            growing_season: 'Winter',
            days_to_harvest: 120,
            created_at: new Date().toISOString(),
          },
        ];
        
        setCrops(mockCrops);
        setError(null);
      } catch (error) {
        console.error('Crops fetching error:', error);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrops();
  }, [user, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this crop?')) {
      try {
        // In a real app, this would be a Supabase delete operation
        setCrops(crops.filter(crop => crop.id !== id));
        toast.success('Crop deleted successfully');
      } catch (error) {
        console.error('Error deleting crop:', error);
        toast.error('Failed to delete crop');
      }
    }
  };

  const filteredCrops = crops.filter(
    crop => 
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      crop.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.growing_season.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Crops</h1>
            <p className="text-muted-foreground">Manage your crop varieties</p>
          </div>
          <Link to="/crops/new">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" /> Add Crop
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search crops by name, type, or growing season..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCrops.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium">No crops match your search</p>
                  <p className="text-muted-foreground mt-1">Try different search terms</p>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Sprout className="h-8 w-8 text-amber-600" />
                  </div>
                  <p className="text-lg font-medium">No crops yet</p>
                  <p className="text-muted-foreground mt-1">Add a new crop to start tracking your plantings</p>
                  <Link to="/crops/new" className="mt-4 inline-block">
                    <Button size="sm" variant="outline">Add Your First Crop</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map((crop) => (
              <Card key={crop.id} className="overflow-hidden">
                <div className="h-32 bg-amber-100 flex items-center justify-center">
                  <Sprout className="h-12 w-12 text-amber-600" />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg truncate">{crop.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{crop.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/crops/edit/${crop.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(crop.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Season</p>
                      <p className="font-medium">{crop.growing_season}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days to Harvest</p>
                      <p className="font-medium">{crop.days_to_harvest} days</p>
                    </div>
                  </div>
                  <Link to={`/crops/${crop.id}`} className="mt-4 inline-block w-full">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
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
