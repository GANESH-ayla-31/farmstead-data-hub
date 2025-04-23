
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MapPin, 
  Sprout, 
  User
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-farm-green-dark">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-farm-green-dark">Available pages:</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/farmlands" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-3">
                <MapPin className="h-4 w-4" />
                <span>Farmlands</span>
              </Button>
            </Link>
            <Link to="/crops" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-3">
                <Sprout className="h-4 w-4" />
                <span>Crops</span>
              </Button>
            </Link>
            <Link to="/profile" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-3">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
