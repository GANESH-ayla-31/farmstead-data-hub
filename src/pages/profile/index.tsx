
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FarmerProfile {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  contact_number: string;
  address: string;
  email: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !isAuthenticated || !isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile for user:", user.id);
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching farmer profile:', error);
          return;
        }
        
        if (data) {
          console.log("Profile found:", data);
          setFarmerProfile(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            contact_number: data.contact_number || '',
            address: data.address || ''
          });
        } else {
          // No profile exists, try to create one
          console.log("No profile found, creating default profile");
          await createDefaultProfile();
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const createDefaultProfile = async () => {
      if (!user) return;
      
      try {
        const userData = {
          user_id: user.id,
          name: user.user_metadata?.full_name || 'Farmer',
          email: user.email || '',
          contact_number: user.user_metadata?.phone || '',
          address: ''
        };
        
        console.log("Creating default profile with data:", userData);
        const { data, error } = await supabase
          .from('farmers')
          .insert(userData)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating farmer profile:', error);
          toast.error('Failed to create profile. Please try again.');
          return;
        }
        
        if (data) {
          console.log("Default profile created:", data);
          setFarmerProfile(data);
          setFormData({
            name: data.name,
            email: data.email,
            contact_number: data.contact_number,
            address: data.address
          });
          toast.success('Profile created successfully');
        }
      } catch (error) {
        console.error('Profile creation error:', error);
        toast.error('An unexpected error occurred');
      }
    };
    
    fetchProfile();
  }, [user, isAuthenticated]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (!farmerProfile) {
      console.log("No farmer profile to update, creating new profile");
      await createDefaultProfile();
      return;
    }
    
    setIsSubmitting(true);
    console.log("Updating profile:", farmerProfile.id, formData);
    
    try {
      const { error } = await supabase
        .from('farmers')
        .update({
          name: formData.name,
          email: formData.email,
          contact_number: formData.contact_number,
          address: formData.address
        })
        .eq('id', farmerProfile.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile: ' + error.message);
      } else {
        console.log("Profile updated successfully");
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDefaultProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const userData = {
        user_id: user.id,
        name: formData.name || user.user_metadata?.full_name || 'Farmer',
        email: formData.email || user.email || '',
        contact_number: formData.contact_number || user.user_metadata?.phone || '',
        address: formData.address || ''
      };
      
      console.log("Creating profile with data:", userData);
      const { data, error } = await supabase
        .from('farmers')
        .insert(userData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating farmer profile:', error);
        toast.error('Failed to create profile: ' + error.message);
        return;
      }
      
      if (data) {
        console.log("Profile created:", data);
        setFarmerProfile(data);
        toast.success('Profile created successfully');
      }
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Farmer Profile</h1>
          <p className="text-muted-foreground">Manage your personal and contact information</p>
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

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.name ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact_number" className="text-sm font-medium">
                    Contact Number
                  </label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className={errors.contact_number ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.contact_number && (
                    <p className="text-sm text-destructive">{errors.contact_number}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Farm Road, Rural County"
                    className={errors.address ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
