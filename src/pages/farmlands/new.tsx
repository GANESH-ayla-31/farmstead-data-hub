
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [soilType, setSoilType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [farmerError, setFarmerError] = useState<string | null>(null);
  const [isCreatingFarmer, setIsCreatingFarmer] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  useEffect(() => {
    const getFarmerProfile = async () => {
      if (!user || !isAuthenticated) return;

      try {
        // First check localStorage for a profile
        const localProfile = localStorage.getItem('farmtrack_profile');
        if (localProfile) {
          try {
            const parsedProfile = JSON.parse(localProfile);
            console.log("Found profile in localStorage:", parsedProfile);
            setFarmerId(parsedProfile.id);
            setUsingLocalStorage(true);
            return;
          } catch (error) {
            console.error('Error parsing localStorage profile:', error);
          }
        }
        
        // If no local profile or failed to parse, check database if configured
        if (isSupabaseConfigured()) {
          // Check if farmer profile exists
          const { data: existingFarmer, error: checkError } = await supabase
            .from('farmers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (checkError) {
            console.error('Error checking for farmer profile:', checkError);
            setFarmerError('Error checking for farmer profile. Please refresh and try again.');
            return;
          }
          
          // If farmer exists, store ID and return
          if (existingFarmer) {
            setFarmerId(existingFarmer.id);
            return;
          }
          
          // If no farmer profile exists, create one
          setIsCreatingFarmer(true);
          
          // Create farmer profile with user's basic info
          const { data: newFarmer, error: createError } = await supabase
            .from('farmers')
            .insert({
              user_id: user.id,
              name: user.user_metadata?.full_name || 'Farmer',
              email: user.email || '',
              contact_number: user.user_metadata?.phone || '',
              address: ''
            })
            .select('id')
            .single();
            
          if (createError) {
            console.error('Error creating farmer profile:', createError);
            setFarmerError('Could not create farmer profile. Creating a local profile instead.');
            await createLocalProfile();
            return;
          }
          
          setFarmerId(newFarmer.id);
          toast.success('Farmer profile created successfully');
        } else {
          // If Supabase isn't configured, just use localStorage
          await createLocalProfile();
        }
      } catch (error) {
        console.error('Error in farmer profile operation:', error);
        setFarmerError('An unexpected error occurred. Creating a local profile instead.');
        await createLocalProfile();
      } finally {
        setIsCreatingFarmer(false);
      }
    };
    
    const createLocalProfile = async () => {
      if (!user) return;
      
      try {
        const userData = {
          id: crypto.randomUUID(),
          user_id: user.id,
          name: user.user_metadata?.full_name || 'Farmer',
          email: user.email || '',
          contact_number: user.user_metadata?.phone || '',
          address: '',
          created_at: new Date().toISOString()
        };
        
        console.log("Creating local profile with data:", userData);
        
        // Save to localStorage
        localStorage.setItem('farmtrack_profile', JSON.stringify(userData));
        
        setFarmerId(userData.id);
        setUsingLocalStorage(true);
        toast.success('Local profile created successfully');
      } catch (error) {
        console.error('Local profile creation error:', error);
        setFarmerError('Failed to create even a local profile. Please try again.');
      }
    };

    getFarmerProfile();
  }, [user, isAuthenticated]);

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
    
    if (!validate() || !farmerId) return;
    
    setIsSubmitting(true);
    
    try {
      const farmlandData = {
        id: crypto.randomUUID(),
        farmer_id: farmerId,
        name,
        location,
        size_hectares: parseFloat(size),
        soil_type: soilType,
        created_at: new Date().toISOString(),
      };

      if (usingLocalStorage || !isSupabaseConfigured()) {
        // Save to localStorage
        const existingFarmlandsJson = localStorage.getItem('farmtrack_farmlands');
        const existingFarmlands = existingFarmlandsJson ? JSON.parse(existingFarmlandsJson) : [];
        
        const updatedFarmlands = [farmlandData, ...existingFarmlands];
        localStorage.setItem('farmtrack_farmlands', JSON.stringify(updatedFarmlands));
        
        toast.success('Farmland added successfully (locally)');
        navigate('/farmlands');
      } else {
        // Add to Supabase
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
          // Fallback to localStorage if database insert fails
          console.error('Error adding farmland to database:', error);
          
          // Save to localStorage as fallback
          const existingFarmlandsJson = localStorage.getItem('farmtrack_farmlands');
          const existingFarmlands = existingFarmlandsJson ? JSON.parse(existingFarmlandsJson) : [];
          
          const updatedFarmlands = [farmlandData, ...existingFarmlands];
          localStorage.setItem('farmtrack_farmlands', JSON.stringify(updatedFarmlands));
          
          toast.success('Farmland added successfully (locally)');
          navigate('/farmlands');
          return;
        }

        toast.success('Farmland added successfully');
        navigate('/farmlands');
      }
    } catch (error: any) {
      console.error('Error adding farmland:', error);
      toast.error('Failed to add farmland');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfigured = isSupabaseConfigured();

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
              Supabase is not properly configured. Your data will be saved locally only.
            </AlertDescription>
          </Alert>
        )}

        {usingLocalStorage && isConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>
              Using local storage for farmland data. Database connection will be attempted on next save.
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
                  disabled={isSubmitting || isCreatingFarmer}
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
                  disabled={isSubmitting || isCreatingFarmer}
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
                  disabled={isSubmitting || isCreatingFarmer}
                />
                {errors.size && (
                  <p className="text-sm text-destructive">{errors.size}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="soilType" className="text-sm font-medium">
                  Soil Type
                </label>
                <Select value={soilType} onValueChange={setSoilType} disabled={isSubmitting || isCreatingFarmer}>
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
                  <Button variant="outline" type="button" disabled={isSubmitting || isCreatingFarmer}>Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isCreatingFarmer || !farmerId} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreatingFarmer ? 'Creating profile...' : 
                   isSubmitting ? 'Adding...' : 'Add Farmland'}
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
