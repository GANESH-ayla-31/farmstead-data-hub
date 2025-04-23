import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sprout, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  Cloud, 
  TrendingUp 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardStats {
  active_crops: number;
  upcoming_harvests: number;
  total_farmland: number;
  low_resources: number;
}

interface WeatherData {
  date: string;
  temperature: number;
}

interface CropCycle {
  id: string;
  crop_name: string;
  farmland_name: string;
  status: string;
  expected_harvest_date: string;
  days_to_harvest: number;
}

const Dashboard = () => {
  const { user, isConfigured } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [upcomingHarvests, setUpcomingHarvests] = useState<CropCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [farmerId, setFarmerId] = useState<string | null>(null);

  useEffect(() => {
    const getFarmerId = async () => {
      if (!user || !isConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching farmer data:', error);
          return null;
        }

        if (data) {
          setFarmerId(data.id);
          return data.id;
        } else {
          console.error('No farmer found for this user');
          return null;
        }
      } catch (error) {
        console.error('Error in getFarmerId:', error);
        return null;
      }
    };

    const fetchFarmerData = async () => {
      if (!user || !isConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const farmerId = await getFarmerId();
        if (!farmerId) {
          setIsLoading(false);
          return;
        }

        const { data: dashboardStats, error: statsError } = await supabase
          .rpc('get_farmer_dashboard', { farmer_id: farmerId });

        if (statsError) {
          console.error('Error fetching dashboard stats:', statsError);
        } else {
          setStats(dashboardStats as DashboardStats);
        }

        const { data: harvestData, error: harvestError } = await supabase
          .from('active_crop_cycles')
          .select('id, crop_name, farmland_name, status, expected_harvest_date, days_to_harvest')
          .eq('farmer_id', farmerId)
          .eq('status', 'growing')
          .order('days_to_harvest', { ascending: true })
          .limit(5);

        if (harvestError) {
          console.error('Error fetching harvest data:', harvestError);
        } else {
          setUpcomingHarvests(harvestData || []);
        }

        const { data: farmlandIds } = await supabase
          .from('farmlands')
          .select('id')
          .eq('farmer_id', farmerId);

        if (farmlandIds && farmlandIds.length > 0) {
          const { data: weatherDataResult, error: weatherError } = await supabase
            .from('weather_data')
            .select('date, temperature')
            .in('farmland_id', farmlandIds.map(f => f.id))
            .order('date', { ascending: false })
            .limit(7);

          if (weatherError) {
            console.error('Error fetching weather data:', weatherError);
          } else {
            setWeatherData(weatherDataResult ? [...weatherDataResult].reverse() : []);
          }
        }
      } catch (error) {
        console.error('Dashboard data fetching error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerData();
  }, [user, isConfigured]);

  const demoWeatherData = weatherData.length > 0 ? weatherData : [
    { date: '2023-04-17', temperature: 24 },
    { date: '2023-04-18', temperature: 22 },
    { date: '2023-04-19', temperature: 25 },
    { date: '2023-04-20', temperature: 27 },
    { date: '2023-04-21', temperature: 26 },
    { date: '2023-04-22', temperature: 29 },
    { date: '2023-04-23', temperature: 28 },
  ];

  if (!isConfigured) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your farm management dashboard.</p>
          </div>
          
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-bold text-amber-800">Supabase Configuration Issue</h3>
                  <p className="text-amber-700 mt-1">
                    The connection to the database is not properly configured. Some features may not work correctly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data (Database not connected)</CardTitle>
              <CardDescription>This is sample data for demonstration purposes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please ensure your database connection is configured correctly to see your real data.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your farm management dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Crops</p>
                <h2 className="text-3xl font-bold">{stats?.active_crops || 0}</h2>
              </div>
              <Sprout className="h-8 w-8 text-farm-green" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Harvests</p>
                <h2 className="text-3xl font-bold">{stats?.upcoming_harvests || 0}</h2>
              </div>
              <Clock className="h-8 w-8 text-farm-brown" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Farmland (ha)</p>
                <h2 className="text-3xl font-bold">{stats?.total_farmland || 0}</h2>
              </div>
              <MapPin className="h-8 w-8 text-farm-blue" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Resources</p>
                <h2 className="text-3xl font-bold">{stats?.low_resources || 0}</h2>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Harvests
                  </CardTitle>
                  <CardDescription>Monitor your next harvest dates</CardDescription>
                </div>
                <Link to="/crops">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingHarvests.length > 0 ? (
                <div className="space-y-4">
                  {upcomingHarvests.map((crop) => (
                    <div key={crop.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{crop.crop_name}</p>
                        <p className="text-sm text-muted-foreground">{crop.farmland_name}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${crop.days_to_harvest <= 7 ? 'text-destructive' : ''}`}>
                          {crop.days_to_harvest} days left
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(crop.expected_harvest_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming harvests</p>
                  <Link to="/farmlands/new" className="text-farm-green hover:underline mt-2 inline-block">
                    Add a farmland first
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Temperature Trend
              </CardTitle>
              <CardDescription>Past 7 days temperature (°C)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoWeatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}°C`, 'Temperature']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#2D5F2E" 
                      strokeWidth={2}
                      dot={{ stroke: '#2D5F2E', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#2D5F2E', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Latest Market Prices
                  </CardTitle>
                  <CardDescription>Current crop prices in your region</CardDescription>
                </div>
                <Link to="/market">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Wheat</div>
                  <div className="text-2xl font-bold">$7.21/kg</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">+0.8% <TrendingUp className="h-3 w-3 ml-1" /></div>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Corn</div>
                  <div className="text-2xl font-bold">$4.35/kg</div>
                  <div className="text-xs text-red-500 flex items-center mt-1">-1.2% <TrendingUp className="h-3 w-3 ml-1 rotate-180" /></div>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Soybeans</div>
                  <div className="text-2xl font-bold">$12.48/kg</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">+2.1% <TrendingUp className="h-3 w-3 ml-1" /></div>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Rice</div>
                  <div className="text-2xl font-bold">$9.17/kg</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">+0.3% <TrendingUp className="h-3 w-3 ml-1" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
