
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

  useEffect(() => {
    const createFarmerProfile = async () => {
      if (!user || !isAuthenticated || !isSupabaseConfigured()) return;
      
      try {
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
          setFarmerError('Could not create farmer profile. Please try again later.');
          return;
        }
        
        setFarmerId(newFarmer.id);
        toast.success('Farmer profile created successfully');
      } catch (error) {
        console.error('Error in farmer profile creation:', error);
        setFarmerError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsCreatingFarmer(false);
      }
    };
    
    createFarmerProfile();
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
      // Add farmland
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
        throw new Error(error.message);
      }

      toast.success('Farmland added successfully');
      navigate('/farmlands');
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
