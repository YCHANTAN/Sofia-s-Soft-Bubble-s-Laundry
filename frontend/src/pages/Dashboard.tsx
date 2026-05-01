import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, CheckCircle, Clock, Wind, RotateCcw, Plus, Search, LucideIcon, TrendingUp, Users } from 'lucide-react';
import { Order, Customer, DashboardStats } from '../types';
import toast from 'react-hot-toast';

interface StatusColumn {
  id: Order['status'];
  label: string;
  icon: LucideIcon;
  color: string;
}

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'Pending', label: 'Pending', icon: Clock, color: 'bg-amber-50' },
  { id: 'Washing', label: 'Washing', icon: RotateCcw, color: 'bg-blue-50' },
  { id: 'Drying', label: 'Drying', icon: Wind, color: 'bg-orange-50' },
  { id: 'Ready', label: 'Ready', icon: ShoppingBag, color: 'bg-emerald-50' },
  { id: 'Completed', label: 'Completed', icon: CheckCircle, color: 'bg-[#00B5B8]/5' },
];

const OrderCard = ({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: number, status: Order['status']) => void }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-[#00B5B8]/5 mb-4 hover:shadow-md hover:border-[#00B5B8]/20 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-black text-[#00B5B8]/40 uppercase tracking-widest mb-1">#{order.id}</p>
          <h3 className="font-black text-gray-800 group-hover:text-[#00B5B8] transition-colors leading-tight">{order.full_name}</h3>
        </div>
        <span className="text-[10px] font-black bg-[#00B5B8]/10 text-[#00B5B8] px-2 py-1 rounded-lg uppercase">
          {order.weight_kg}kg
        </span>
      </div>
      <p className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-tighter">{order.service_type}</p>
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <span className="text-sm font-black text-[#00B5B8]">₱{order.total_amount}</span>
        <select 
          value={order.status}
          onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
          className="text-[10px] font-black uppercase tracking-wider bg-gray-50 border-none rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-[#00B5B8]/20 cursor-pointer transition-all"
        >
          {STATUS_COLUMNS.map(col => (
            <option key={col.id} value={col.id}>{col.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    todayRevenue: 0,
    newCustomersToday: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newOrder, setNewOrder] = useState({
    weight_kg: '',
    service_type: 'Wash & Dry',
    total_amount: '0'
  });

  const fetchOrders = async () => {
    try {
      const response = await api.get<Order[]>('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<DashboardStats>('/reports/dashboard-stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchCustomers = async () => {
    if (customerSearch.length < 2) return;
    try {
      const response = await api.get<Customer[]>(`/customers?search=${customerSearch}`);
      setCustomers(response.data);
    } catch (err) {
      console.error('Error searching customers:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  // Auto-calculate amount when weight changes
  useEffect(() => {
    const weight = parseFloat(newOrder.weight_kg);
    if (!isNaN(weight)) {
      setNewOrder(prev => ({
        ...prev,
        total_amount: (weight * 33).toFixed(2)
      }));
    } else {
      setNewOrder(prev => ({
        ...prev,
        total_amount: '0'
      }));
    }
  }, [newOrder.weight_kg]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Please select an existing customer.');
      return;
    }

    const loadingToast = toast.loading('Creating order...');
    try {
      await api.post('/orders', {
        ...newOrder,
        customer_id: selectedCustomer.id,
        weight_kg: parseFloat(newOrder.weight_kg),
        total_amount: parseFloat(newOrder.total_amount)
      });
      toast.success('Order created!', { id: loadingToast });
      setShowModal(false);
      setSelectedCustomer(null);
      setNewOrder({ weight_kg: '', service_type: 'Wash & Dry', total_amount: '0' });
      fetchOrders();
    } catch (err) {
      toast.error('Failed to create order.', { id: loadingToast });
      console.error('Error creating order:', err);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order #${orderId} is now ${newStatus}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update status.', { id: loadingToast });
      console.error('Error updating order status:', err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Operational Dashboard</h1>
          <p className="text-gray-500">Track and manage active laundry orders</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#00B5B8]/10 hover:bg-[#00B5B8]/20 text-[#00B5B8] px-6 py-3 rounded-2xl flex items-center transition-all duration-200 border border-[#00B5B8]/20 font-bold shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today's Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800">₱{stats.todayRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mr-4">
            <ShoppingBag className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.activeOrders}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">New Customers Today</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.newCustomersToday}</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
        {STATUS_COLUMNS.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`flex items-center p-4 rounded-t-[2rem] ${column.color} border-b-2 border-white/50`}>
              <div className="p-2 bg-white/50 rounded-xl mr-3">
                <column.icon className="w-4 h-4 text-[#00B5B8]" />
              </div>
              <h2 className="font-black text-[#00B5B8] uppercase tracking-widest text-[10px]">{column.label}</h2>
              <span className="ml-auto bg-white/80 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-black text-[#00B5B8] shadow-sm">
                {orders.filter(o => o.status === column.id).length}
              </span>
            </div>
            <div className="bg-[#00B5B8]/5 p-4 rounded-b-[2rem] min-h-[500px] border-x border-b border-[#00B5B8]/5">
              {orders
                .filter((order) => order.status === column.id)
                .map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Light Glassmorphism Backdrop */}
          <div 
            className="absolute inset-0 bg-white/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,76,106,0.15)] w-full max-w-[500px] max-h-[90vh] overflow-y-auto border border-white/20 animate-fadeIn">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-[#00B5B8]/10 rounded-2xl flex items-center justify-center mr-4">
                <Plus className="w-6 h-6 text-[#00B5B8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
                <p className="text-sm text-gray-500 font-medium">Register a new laundry service</p>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Search Customer</label>
                {!selectedCustomer ? (
                  <div className="relative group">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#00B5B8] transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 focus:bg-white transition-all"
                      placeholder="Type name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                    {customers.length > 0 && customerSearch.length >= 2 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-[#00B5B8]/10 rounded-2xl shadow-xl max-h-52 overflow-y-auto overflow-hidden">
                        {customers.map(c => (
                          <div 
                            key={c.id} 
                            className="p-4 hover:bg-[#00B5B8]/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomers([]);
                              setCustomerSearch('');
                            }}
                          >
                            <p className="font-bold text-sm text-gray-900">{c.full_name}</p>
                            <p className="text-xs text-gray-500 font-medium">{c.phone_number}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-[#00B5B8]/5 border border-[#00B5B8]/10 rounded-2xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#00B5B8] font-bold mr-3 border border-[#00B5B8]/10">
                        {selectedCustomer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#00B5B8] text-sm">{selectedCustomer.full_name}</p>
                        <p className="text-xs text-[#00B5B8]/60 font-medium">{selectedCustomer.phone_number}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs font-bold text-[#00B5B8] hover:underline bg-white px-3 py-1.5 rounded-lg border border-[#00B5B8]/10"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 focus:bg-white transition-all font-semibold"
                    value={newOrder.weight_kg}
                    onChange={(e) => setNewOrder({ ...newOrder, weight_kg: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Service Type</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold cursor-not-allowed"
                    value="Wash & Dry"
                    disabled
                  />
                </div>
              </div>

              <div className="bg-[#00B5B8]/5 rounded-2xl p-6 border border-[#00B5B8]/10">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-bold text-gray-600">Total Amount</label>
                  <span className="text-xs font-bold text-[#00B5B8]/60 uppercase tracking-wider">Rate: ₱33.00/kg</span>
                </div>
                <div className="text-3xl font-black text-[#00B5B8]">
                  ₱{newOrder.total_amount}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00B5B8] text-white font-bold py-4 rounded-2xl hover:bg-[#00B5B8]/90 transition-all shadow-lg shadow-[#00B5B8]/20"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
