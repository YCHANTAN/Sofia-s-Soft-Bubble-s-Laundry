import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import laundryLogo from '../assets/Laundry-Logo.svg';
import loginDesign from '../assets/Store.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'customer' | 'staff' | 'admin'>('customer');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(username, password);
      
      // Enforce role-based access based on the selected tab
      if (user.role !== role) {
        logout(); // Clear the session if role doesn't match
        setError(`Access denied. This account does not have ${role} privileges.`);
        return;
      }

      if (user.role === 'customer') {
        navigate('/my-orders');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Hero Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img
          src={loginDesign}
          alt="Sofia's Soft Bubbles Hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Overlay Card */}
        <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-4">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl max-w-md shadow-lg border border-white/20">
            <h1 className="text-3xl font-bold text-[#00B5B8] mb-3">Sofia's Soft Bubbles</h1>
            <p className="text-gray-700 leading-relaxed">
              People trust hand-washed clothes because they know it's truly clean — just like how Tacloban trusts Sofia's Soft Bubbles for quality, affordable laundry care.
            </p>
          </div>
          
          <a 
            href="https://www.facebook.com/sofiassoftbubbleslaundry?rdid=CrULvJNgpxpyT0ez&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FRPEfi1JT#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg group active:scale-95 ml-2"
          >
            <svg 
              className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Visit our Facebook Page
          </a>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fdfdfd] relative">
        {/* Logo in top right */}
        <div className="absolute top-8 right-8">
          <img src={laundryLogo} alt="Sofia's Soft Bubbles Logo" className="w-16 h-16 object-contain" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            {(['customer', 'staff', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setError(''); // Clear error when switching tabs
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  role === r
                    ? 'bg-white text-[#00B5B8] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B5B8]/20 focus:border-[#00B5B8] bg-white transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B5B8]/20 focus:border-[#00B5B8] bg-white transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#00B5B8] focus:ring-[#00B5B8] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00B5B8] hover:bg-[#009699] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#00B5B8]/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
