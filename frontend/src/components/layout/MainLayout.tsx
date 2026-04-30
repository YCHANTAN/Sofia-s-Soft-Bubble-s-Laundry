import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  LogOut, 
  TrendingUp,
  History,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles: ('admin' | 'staff' | 'customer')[];
}

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { name: 'My Laundry Orders', path: '/my-orders', icon: ShoppingBag, roles: ['customer'] },
    { name: 'View History', path: '/my-history', icon: History, roles: ['customer'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'staff'] },
    { name: 'Orders', path: '/orders', icon: ShoppingBag, roles: ['admin', 'staff'] },
    { name: 'Staff Management', path: '/staff', icon: Users, roles: ['admin'] },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp, roles: ['admin'] },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600">Soft Bubbles</h1>
        <p className="text-xs text-gray-500 mt-1">Laundry Management System</p>
      </div>

      <nav className="flex-1 mt-6">
        {navItems.map((item) => {
          if (user && !item.roles.includes(user.role)) return null;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
