
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Sprout, 
  Droplets, 
  Wind, 
  BarChart3, 
  Settings, 
  LogOut, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/' },
    { name: 'Farmlands', icon: <MapPin className="h-5 w-5" />, path: '/farmlands' },
    { name: 'Crops', icon: <Sprout className="h-5 w-5" />, path: '/crops' },
    { name: 'Resources', icon: <Droplets className="h-5 w-5" />, path: '/resources' },
    { name: 'Weather', icon: <Wind className="h-5 w-5" />, path: '/weather' },
    { name: 'Market', icon: <BarChart3 className="h-5 w-5" />, path: '/market' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-farm-green-dark text-white transition-transform lg:static lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8" />
            <span className="text-xl font-bold">FarmTrack</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-white hover:bg-farm-green" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md transition-colors hover:bg-farm-green",
                    location.pathname === item.path && "bg-farm-green font-medium"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button 
            variant="outline" 
            className="w-full border-white text-white hover:bg-white hover:text-farm-green-dark"
            onClick={async () => {
              await signOut();
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
