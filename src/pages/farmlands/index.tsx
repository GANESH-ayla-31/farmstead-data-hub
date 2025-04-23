
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Search, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Farmland {
  id: string;
  name: string;
  location: string;
  size_hectares: number;
  soil_type: string;
  created_at: string;
}

const FarmlandsPage = () => {
  const { user } = useAuth();
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFarmlands = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // First get the farmer ID
        const { data: farmerData, error: farmerError } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (farmerError || !farmerData) {
          console.error('Error fetching farmer data:', farmerError);
          return;
        }

        const farmerId = farmerData.id;

        // Then get all farmlands for this farmer
        const { data, error } = await supabase
          .from('farmlands')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching farmlands:', error);
          return;
        }

        setFarmlands(data || []);
      } catch (error) {
        console.error('Farmlands fetching error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmlands();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this farmland? This will also delete all associated crop cycles and data.')) {
      try {
        const { error } = await supabase
          .from('farmlands')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        setFarmlands(farmlands.filter(farmland => farmland.id !== id));
        toast.success('Farmland deleted successfully');
      } catch (error) {
        console.error('Error deleting farmland:', error);
        toast.error('Failed to delete farmland');
      }
    }
  };

  const filteredFarmlands = farmlands.filter(
    farmland => 
      farmland.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      farmland.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmland.soil_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Farmlands</h1>
            <p className="text-muted-foreground">Manage your farmland properties</p>
          </div>
          <Link to="/farmlands/new">
            <Button className="bg-farm-green hover:bg-farm-green-dark">
              <Plus className="h-4 w-4 mr-2" /> Add Farmland
            </Button>
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search farmlands by name, location, or soil type..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFarmlands.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium">No farmlands match your search</p>
                  <p className="text-muted-foreground mt-1">Try different search terms</p>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-farm-green" />
                  </div>
                  <p className="text-lg font-medium">No farmlands yet</p>
                  <p className="text-muted-foreground mt-1">Add a new farmland to start managing your crops</p>
                  <Link to="/farmlands/new" className="mt-4 inline-block">
                    <Button size="sm" variant="outline">Add Your First Farmland</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFarmlands.map((farmland) => (
              <Card key={farmland.id} className="overflow-hidden">
                <div className="h-32 bg-farm-green/10 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-farm-green" />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg truncate">{farmland.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{farmland.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/farmlands/edit/${farmland.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(farmland.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{farmland.size_hectares} hectares</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Soil Type</p>
                      <p className="font-medium">{farmland.soil_type}</p>
                    </div>
                  </div>
                  <Link to={`/farmlands/${farmland.id}`} className="mt-4 inline-block w-full">
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

export default FarmlandsPage;
