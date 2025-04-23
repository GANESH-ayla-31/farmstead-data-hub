
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CalendarPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          setHasProfile(false);
        } else {
          setHasProfile(!!data);
          
          if (data) {
            // In the future, we could load calendar events here
            // For now we'll just set placeholder data
            setEvents([]);
          }
        }
      } catch (err) {
        console.error('Error in profile check:', err);
      } finally {
        setCheckingProfile(false);
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
        <div>
          <h1 className="text-2xl font-bold">Harvest Calendar</h1>
          <p className="text-muted-foreground">Plan and track your planting and harvest dates</p>
        </div>

        {checkingProfile ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Checking your profile...</span>
          </div>
        ) : !hasProfile ? (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Profile Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              You need to create a farmer profile before managing your calendar.
              <div className="mt-4">
                <Button onClick={handleCreateProfile} className="bg-green-600 hover:bg-green-700">
                  Create Your Profile
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Monthly View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The harvest calendar feature is currently in development. Soon you'll be able to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Track planting dates</li>
                  <li>Schedule harvests</li>
                  <li>Set reminders</li>
                  <li>View crop rotations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
