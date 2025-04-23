
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured, verifyDatabaseConnection } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { v4 as uuidv4 } from '@/lib/uuid-helper';

const SOIL_TYPES = [
  'Clay',
  'Sandy',
  'Silty',
  'Peaty',
  'Chalky',
  'Loamy',
  'Clay Loam',
  'Sandy Clay',
  'Silty Clay',
  'Sandy Loam',
];

const NewFarmlandPage = () => {
  const { user, isConfigured } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [soilType, setSoilType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmerError, setFarmerError] = useState<string | null>(null);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isConfigured) return;
      
      const connected = await verifyDatabaseConnection();
      console.log('Database connection test:', connected);
      setDbConnected(connected);
      
      if (!connected) {
        setFarmerError("Database connection failed. Please check your Supabase configuration.");
        return;
      }
    };
    
    checkConnection();
  }, [isConfigured]);
  
  useEffect(() => {
    const getFarmerId = async () => {
      if (!user || !isConfigured || !dbConnected) return;
      
      try {
        // First attempt: Check if farmer already exists
        const { data: farmerData, error } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error getting farmer ID:', error);
          setFarmerError('Error checking for farmer profile: ' + error.message);
          return;
        }
        
        if (farmerData) {
          console.log('Found farmer ID:', farmerData.id);
          setFarmerId(farmerData.id);
          return;
        }
        
        // Second attempt: Create farmer using RPC function
        console.log('No farmer found, creating via direct insert');
        
        // Create a farmer directly using insert
        const { data: directInsert, error: insertError } = await supabase
          .from('farmers')
          .insert({
            user_id: user.id,
            name: user.name || 'New Farmer',
            email: user.email,
            contact_number: '000-000-0000',
            address: 'No address provided'
          })
          .select('id')
          .single();
          
        if (insertError) {
          console.error('Direct insert failed:', insertError);
          
          // Third attempt: Create a completely new UUID for the farmer
          const customUuid = uuidv4();
          console.log('Trying with custom UUID:', customUuid);
          
          const { data: fallbackInsert, error: fallbackError } = await supabase
            .from('farmers')
            .insert({
              user_id: customUuid, // Use generated UUID instead of auth user ID
              name: user.name || 'New Farmer',
              email: user.email,
              contact_number: '000-000-0000',
              address: 'No address provided'
            })
            .select('id')
            .single();
            
          if (fallbackError) {
            console.error('All farmer creation attempts failed:', fallbackError);
            setFarmerError('Could not create farmer profile. Please try again later.');
            return;
          }
          
          console.log('Created farmer with custom UUID:', fallbackInsert);
          setFarmerId(fallbackInsert.id);
          return;
        }
        
        console.log('Created farmer via direct insert:', directInsert);
        setFarmerId(directInsert.id);
      } catch (error: any) {
        console.error('Error in farmer ID retrieval:', error);
        setFarmerError(error.message || 'Failed to get farmer profile');
      }
    };
    
    if (dbConnected && user) {
      getFarmerId();
    }
  }, [user, isConfigured, dbConnected]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!size.trim()) newErrors.size = 'Size is required';
    else if (isNaN(parseFloat(size)) || parseFloat(size) <= 0) newErrors.size = 'Size must be a positive number';
    if (!soilType) newErrors.soilType = 'Soil type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !user) return;
    if (!farmerId) {
      setFarmerError('No farmer profile found. Please try refreshing the page.');
      return;
    }
    
    setIsSubmitting(true);
    setFarmerError(null);
    
    try {
      if (!isConfigured) {
        throw new Error("Supabase is not properly configured");
      }
      
      console.log('Adding farmland for farmer ID:', farmerId);
      
      const { error } = await supabase
        .from('farmlands')
        .insert({
          farmer_id: farmerId,
          name,
          location,
          size_hectares: parseFloat(size),
          soil_type: soilType,
        });

      if (error) {
        throw error;
      }

      toast.success('Farmland added successfully');
      navigate('/farmlands');
    } catch (error: any) {
      console.error('Error adding farmland:', error);
      setFarmerError(error.message || 'Failed to add farmland');
      toast.error('Failed to add farmland');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/farmlands" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Farmland</h1>
            <p className="text-muted-foreground">Register a new farmland property</p>
          </div>
        </div>

        {!isConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Supabase is not properly configured. Your data will not be saved to the database.
            </AlertDescription>
          </Alert>
        )}

        {farmerError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{farmerError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Farmland Details</CardTitle>
            <CardDescription>Enter the details of your farmland property</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Farmland Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="North Field"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="County Road 42, Rural Township"
                  className={errors.location ? 'border-destructive' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="size" className="text-sm font-medium">
                  Size (hectares)
                </label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="5.5"
                  className={errors.size ? 'border-destructive' : ''}
                />
                {errors.size && (
                  <p className="text-sm text-destructive">{errors.size}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="soilType" className="text-sm font-medium">
                  Soil Type
                </label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger id="soilType" className={errors.soilType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.soilType && (
                  <p className="text-sm text-destructive">{errors.soilType}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Link to="/farmlands">
                  <Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="bg-farm-green hover:bg-farm-green-dark">
                  {isSubmitting ? 'Adding...' : 'Add Farmland'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewFarmlandPage;
