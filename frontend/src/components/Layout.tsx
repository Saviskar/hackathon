import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  Building,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Classroom Booking</span>
              </Link>
              
              <nav className="hidden md:flex space-x-4">
                {isAdmin ? (
                  <>
                    <Link to="/admin" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                      <Settings className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/rooms" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                      <Building className="h-4 w-4" />
                      <span>Rooms</span>
                    </Link>
                    <Link to="/admin/bookings" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                      <Calendar className="h-4 w-4" />
                      <span>Bookings</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/search" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                      <Search className="h-4 w-4" />
                      <span>Find Rooms</span>
                    </Link>
                    <Link to="/schedule" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                      <Calendar className="h-4 w-4" />
                      <span>My Schedule</span>
                    </Link>
                    <Link to="/timetable" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                      <Clock className="h-4 w-4" />
                      <span>Timetable</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};