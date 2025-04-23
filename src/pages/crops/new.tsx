
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const NewCropPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would save to Supabase
      // For now, we just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Crop added successfully!');
      navigate('/crops');
    } catch (error) {
      console.error('Error adding crop:', error);
      toast.error('Failed to add crop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/crops" className="hover:text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">Add New Crop</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Crop Name</Label>
                  <Input id="name" placeholder="e.g., Corn, Tomatoes, Wheat" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Crop Type</Label>
                  <Select required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grain">Grain</SelectItem>
                      <SelectItem value="vegetable">Vegetable</SelectItem>
                      <SelectItem value="fruit">Fruit</SelectItem>
                      <SelectItem value="legume">Legume</SelectItem>
                      <SelectItem value="root">Root</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="season">Growing Season</Label>
                  <Select required>
                    <SelectTrigger id="season">
                      <SelectValue placeholder="Select growing season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                      <SelectItem value="year_round">Year-round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="days">Days to Harvest</Label>
                  <Input id="days" type="number" min="1" placeholder="e.g., 90" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea 
                  id="notes"
                  className="w-full min-h-[100px] p-2 rounded-md border border-input bg-transparent"
                  placeholder="Additional information about this crop..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/crops')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Crop'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewCropPage;
