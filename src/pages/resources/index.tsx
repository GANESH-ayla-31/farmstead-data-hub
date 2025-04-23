
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Droplets, Sun, FileText } from 'lucide-react';

const ResourcesPage = () => {
  const resources = [
    {
      title: 'Soil Management',
      description: 'Learn about soil health, testing, and improvement strategies',
      icon: <Leaf className="h-8 w-8 text-green-600" />
    },
    {
      title: 'Water Resources',
      description: 'Water conservation techniques and irrigation best practices',
      icon: <Droplets className="h-8 w-8 text-blue-600" />
    },
    {
      title: 'Sustainable Farming',
      description: 'Environmentally friendly farming methods and practices',
      icon: <Sun className="h-8 w-8 text-amber-600" />
    },
    {
      title: 'Farming Guides',
      description: 'Downloadable guides and educational resources',
      icon: <FileText className="h-8 w-8 text-gray-600" />
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Farming Resources</h1>
          <p className="text-muted-foreground">Helpful information and tools for your farm</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                {resource.icon}
                <div>
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to access detailed information and downloadable resources.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Agricultural Extension Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Connect with local agricultural extension agents who can provide personalized advice and assistance 
              with your farming operations.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact information and scheduling options coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ResourcesPage;
