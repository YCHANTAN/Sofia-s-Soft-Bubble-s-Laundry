import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Staff from './pages/Staff';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerHistory from './pages/CustomerHistory';
import Orders from './pages/Orders';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <MainLayout>{children}</MainLayout>;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'customer') {
    return <Navigate to="/my-orders" />;
  }
  return <Dashboard />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><HomeRedirect /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute><Staff /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
          <Route path="/my-history" element={<PrivateRoute><CustomerHistory /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
