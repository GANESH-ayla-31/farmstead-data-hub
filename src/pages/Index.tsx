
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Sprout, Calendar, Info } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Farm Management Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your farm management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Farmlands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage your farmland properties</p>
              <Button 
                onClick={() => navigate('/farmlands')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View Farmlands
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sprout className="mr-2 h-5 w-5" />
                Crops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage your crop plantings</p>
              <Button 
                onClick={() => navigate('/crops')} 
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                View Crops
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Harvest Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage your harvest schedule</p>
              <Button 
                onClick={() => navigate('/calendar')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View Calendar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Farm Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage your farmer profile</p>
              <Button 
                onClick={() => navigate('/profile')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to set up your farm management system</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create your farmer profile with your personal and contact details</li>
              <li>Add your farmland properties with location and soil information</li>
              <li>Plan and record your crop plantings for each farmland</li>
              <li>Track growth progress and record harvests when complete</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;
