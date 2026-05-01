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
  Plus,
  LucideIcon
} from 'lucide-react';
import laundryLogo from '../../assets/Laundry-Logo.svg';

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
    <div className="w-72 bg-white/70 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col border border-[#8B4C6A]/10 shadow-2xl shadow-[#8B4C6A]/10 z-50 rounded-r-[2.5rem]">
      {/* Brand Header */}
      <div className="p-8 flex items-center space-x-3">
        <div className="p-2 bg-[#8B4C6A]/10 rounded-2xl">
          <img src={laundryLogo} alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#8B4C6A] tracking-tight leading-none">Sofia's Soft Bubble's</h1>
          <p className="text-[10px] font-bold text-[#8B4C6A]/40 uppercase tracking-[0.2em] mt-1">Premium Care</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          if (user && !item.roles.includes(user.role)) return null;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-[#8B4C6A] text-white shadow-lg shadow-[#8B4C6A]/20 scale-[1.02]' 
                  : 'text-gray-500 hover:bg-[#8B4C6A]/5 hover:text-[#8B4C6A]'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:scale-110 group-hover:text-[#8B4C6A]'}`} />
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 space-y-4 bg-gradient-to-t from-white/50 to-transparent">
        {/* User Info Card */}
        <div className="bg-white/50 backdrop-blur-sm border border-[#8B4C6A]/10 rounded-3xl p-4 flex items-center justify-between group hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B4C6A] to-[#7A3D5B] flex items-center justify-center text-white font-black text-lg mr-3 shadow-md shadow-[#8B4C6A]/20">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-gray-900 truncate tracking-tight">{user?.username}</p>
              <p className="text-[10px] font-bold text-[#8B4C6A]/60 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#FDFBFC] relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#8B4C6A]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="fixed bottom-0 left-72 w-[400px] h-[400px] bg-[#8B4C6A]/3 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
      
      <Sidebar />
      <div className="pl-72 relative z-10">
        <main className="p-10 max-w-7xl mx-auto min-h-screen">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
