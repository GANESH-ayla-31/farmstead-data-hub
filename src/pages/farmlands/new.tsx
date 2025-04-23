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
  const [creatingFarmer, setCreatingFarmer] = useState<boolean>(false);
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    const logDebug = (message: string) => {
      console.log(message);
      setDebug(prev => [...prev, message]);
    };

    const checkConnection = async () => {
      if (!isConfigured) return;
      
      const connected = await verifyDatabaseConnection();
      logDebug(`Database connection test: ${connected}`);
      setDbConnected(connected);
      
      if (!connected) {
        setFarmerError("Database connection failed. Please check your Supabase configuration.");
        return;
      }
    };
    
    checkConnection();
  }, [isConfigured]);
  
  useEffect(() => {
    const logDebug = (message: string) => {
      console.log(message);
      setDebug(prev => [...prev, message]);
    };

    const createFarmerDirectly = async () => {
      if (!user) {
        logDebug("No user found");
        return null;
      }

      try {
        logDebug(`Attempting direct insert for user_id: ${user.id}`);
        
        const { data, error } = await supabase
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
        
        if (error) {
          logDebug(`Direct insert error: ${error.message}`);
          return null;
        }
        
        if (data) {
          logDebug(`Direct insert succeeded with ID: ${data.id}`);
          return data.id;
        }
      } catch (e: any) {
        logDebug(`Direct insert exception: ${e.message}`);
      }
      return null;
    };

    const createFarmerWithCustomUuid = async () => {
      if (!user) return null;
      
      try {
        const customUuid = uuidv4();
        logDebug(`Attempting with custom UUID: ${customUuid}`);
        
        const { data, error } = await supabase
          .from('farmers')
          .insert({
            user_id: customUuid,
            name: user.name || 'New Farmer',
            email: user.email,
            contact_number: '000-000-0000',
            address: 'No address provided'
          })
          .select('id')
          .single();
        
        if (error) {
          logDebug(`Custom UUID error: ${error.message}`);
          return null;
        }
        
        if (data) {
          logDebug(`Custom UUID insert succeeded with ID: ${data.id}`);
          return data.id;
        }
      } catch (e: any) {
        logDebug(`Custom UUID exception: ${e.message}`);
      }
      return null;
    };

    const createFarmerWithRPC = async () => {
      if (!user) return null;
      
      try {
        logDebug(`Attempting with RPC function`);
        
        const { data, error } = await supabase
          .rpc('create_farmer', {
            p_user_id: user.id,
            p_name: user.name || 'New Farmer',
            p_email: user.email,
            p_contact_number: '000-000-0000',
            p_address: 'No address provided'
          });
        
        if (error) {
          logDebug(`RPC error: ${error.message}`);
          
          const { data: flexData, error: flexError } = await supabase
            .rpc('create_farmer_flexible', {
              p_address: 'No address provided',
              p_contact_number: '000-000-0000',
              p_email: user.email,
              p_name: user.name || 'New Farmer',
              p_user_id: user.id
            });
            
          if (flexError) {
            logDebug(`Flexible RPC error: ${flexError.message}`);
            return null;
          }
          
          if (flexData) {
            logDebug(`Flexible RPC succeeded with ID: ${flexData}`);
            return flexData;
          }
          
          return null;
        }
        
        if (data) {
          logDebug(`RPC succeeded with ID: ${data}`);
          return data;
        }
      } catch (e: any) {
        logDebug(`RPC exception: ${e.message}`);
      }
      return null;
    };
    
    const createFarmerWithSQL = async () => {
      if (!user) return null;
      
      try {
        logDebug(`Attempting with raw SQL`);
        
        const { data, error } = await supabase
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
          
        if (error) {
          logDebug(`SQL error: ${error.message}`);
          return null;
        }
        
        if (data) {
          logDebug(`SQL succeeded with ID: ${data.id}`);
          return data.id;
        }
      } catch (e: any) {
        logDebug(`SQL exception: ${e.message}`);
      }
      return null;
    };

    const getFarmerId = async () => {
      if (!user || !isConfigured || !dbConnected || creatingFarmer) return;
      
      try {
        setCreatingFarmer(true);
        
        logDebug('Checking if farmer exists for user: ' + user.id);
        const { data: farmerData, error } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          logDebug(`Error checking for farmer: ${error.message}`);
        }
        
        if (farmerData) {
          logDebug(`Found existing farmer ID: ${farmerData.id}`);
          setFarmerId(farmerData.id);
          return;
        }
        
        logDebug('No farmer found, attempting to create one...');
        
        let newFarmerId = await createFarmerDirectly();
        
        if (!newFarmerId) {
          newFarmerId = await createFarmerWithCustomUuid();
        }
        
        if (!newFarmerId) {
          newFarmerId = await createFarmerWithRPC();
        }
        
        if (!newFarmerId) {
          newFarmerId = await createFarmerWithSQL();
        }
        
        if (newFarmerId) {
          logDebug(`Successfully created farmer with ID: ${newFarmerId}`);
          setFarmerId(newFarmerId);
        } else {
          logDebug('All farmer creation attempts failed');
          setFarmerError('Could not create farmer profile. Please try again later.');
        }
      } catch (error: any) {
        logDebug(`Error in farmer creation process: ${error.message}`);
        setFarmerError(error.message || 'Failed to create farmer profile');
      } finally {
        setCreatingFarmer(false);
      }
    };
    
    if (dbConnected && user && !farmerId) {
      getFarmerId();
    }
  }, [user, isConfigured, dbConnected, farmerId, creatingFarmer]);

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

        {debug.length > 0 && (
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono overflow-auto max-h-40">
                {debug.map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  <Button variant="outline" type="button" disabled={isSubmitting || creatingFarmer}>Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || creatingFarmer || !farmerId} 
                  className="bg-farm-green hover:bg-farm-green-dark"
                >
                  {creatingFarmer ? 'Creating farmer profile...' : 
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
