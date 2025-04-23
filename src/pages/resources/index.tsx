
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Leaf, Droplets, Sun, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Resource = {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  content: {
    summary: string;
    details: string[];
    links?: { text: string; url: string }[];
  };
};

const ResourcesPage = () => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const resources: Resource[] = [
    {
      id: 'soil',
      title: 'Soil Management',
      description: 'Learn about soil health, testing, and improvement strategies',
      icon: <Leaf className="h-8 w-8 text-green-600" />,
      content: {
        summary: 'Effective soil management is the foundation of successful farming. Learn how to maintain and improve your soil for optimal crop yields.',
        details: [
          'Soil testing is essential for understanding pH levels, nutrient content, and composition.',
          'Regular crop rotation helps prevent nutrient depletion and reduces pest problems.',
          'Cover crops can improve soil structure, prevent erosion, and add organic matter.',
          'Composting farm waste creates valuable natural fertilizer while reducing disposal costs.'
        ],
        links: [
          { text: 'Soil Testing Guide', url: 'https://extension.psu.edu/soil-quality-information' },
          { text: 'Cover Crop Selection Tool', url: 'https://www.sare.org/Learning-Center/Topic-Rooms/Cover-Crops' }
        ]
      }
    },
    {
      id: 'water',
      title: 'Water Resources',
      description: 'Water conservation techniques and irrigation best practices',
      icon: <Droplets className="h-8 w-8 text-blue-600" />,
      content: {
        summary: 'Water is a precious resource in agriculture. Discover efficient irrigation methods and water conservation strategies.',
        details: [
          'Drip irrigation can reduce water usage by up to 60% compared to conventional methods.',
          'Rainwater harvesting systems capture runoff for later use during dry periods.',
          'Soil moisture sensors help determine when irrigation is truly needed.',
          'Mulching reduces evaporation and helps soil retain moisture longer.'
        ],
        links: [
          { text: 'Irrigation Efficiency Calculator', url: 'https://www.nrcs.usda.gov/wps/portal/nrcs/main/national/technical/econ/tools/' },
          { text: 'Drought Management Resources', url: 'https://drought.gov/sectors/agriculture' }
        ]
      }
    },
    {
      id: 'sustainable',
      title: 'Sustainable Farming',
      description: 'Environmentally friendly farming methods and practices',
      icon: <Sun className="h-8 w-8 text-amber-600" />,
      content: {
        summary: 'Sustainable farming practices benefit both the environment and farm profitability in the long term.',
        details: [
          'Integrated pest management reduces chemical use while effectively controlling pests.',
          'Renewable energy options like solar panels can lower farm operating costs.',
          'Agroforestry combines trees and shrubs with crops to improve biodiversity.',
          'No-till farming minimizes soil disturbance and builds soil health over time.'
        ],
        links: [
          { text: 'Sustainable Agriculture Research', url: 'https://www.sare.org/' },
          { text: 'Carbon Footprint Calculator for Farms', url: 'https://coolfarmtool.org/' }
        ]
      }
    },
    {
      id: 'guides',
      title: 'Farming Guides',
      description: 'Downloadable guides and educational resources',
      icon: <FileText className="h-8 w-8 text-gray-600" />,
      content: {
        summary: 'Access comprehensive guides on various farming topics to enhance your agricultural knowledge and skills.',
        details: [
          'Seasonal planting calendars help optimize crop timing and rotation.',
          'Equipment maintenance guides extend the life of farm machinery.',
          'Pest and disease identification references for quick diagnosis.',
          'Financial planning templates for farm budgeting and forecasting.'
        ],
        links: [
          { text: 'USDA Farming Resources', url: 'https://www.farmers.gov/your-business/beginning-farmers' },
          { text: 'Farm Business Planning Tools', url: 'https://www.extension.org/agriculture_farming/' }
        ]
      }
    },
  ];

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Farming Resources</h1>
          <p className="text-muted-foreground">Helpful information and tools for your farm</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <Card 
              key={resource.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleResourceClick(resource)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {resource.icon}
                <div>
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {resource.content.summary.substring(0, 100)}...
                </p>
              </CardContent>
              <CardFooter className="text-sm text-blue-600 flex items-center justify-end">
                <span className="flex items-center">View details <ChevronRight className="h-4 w-4 ml-1" /></span>
              </CardFooter>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedResource && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {selectedResource.icon}
                <DialogTitle>{selectedResource.title}</DialogTitle>
              </div>
              <DialogDescription>{selectedResource.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p>{selectedResource.content.summary}</p>
              
              <h4 className="font-medium text-lg">Key Points</h4>
              <ul className="space-y-2 list-disc pl-5">
                {selectedResource.content.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
              
              {selectedResource.content.links && (
                <>
                  <h4 className="font-medium text-lg">Useful Links</h4>
                  <div className="space-y-2">
                    {selectedResource.content.links.map((link, i) => (
                      <div key={i} className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.text}
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </MainLayout>
  );
};

export default ResourcesPage;
