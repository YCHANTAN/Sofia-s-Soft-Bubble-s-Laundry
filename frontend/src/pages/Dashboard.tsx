import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, CheckCircle, Clock, Wind, RotateCcw, Plus, Search, LucideIcon } from 'lucide-react';

interface StatusColumn {
  id: Order['status'];
  label: string;
  icon: LucideIcon;
  color: string;
}

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'Pending', label: 'Pending', icon: Clock, color: 'bg-gray-100' },
  { id: 'Washing', label: 'Washing', icon: RotateCcw, color: 'bg-blue-100' },
  { id: 'Drying', label: 'Drying', icon: Wind, color: 'bg-yellow-100' },
  { id: 'Ready', label: 'Ready', icon: ShoppingBag, color: 'bg-green-100' },
  { id: 'Completed', label: 'Completed', icon: CheckCircle, color: 'bg-purple-100' },
];

const OrderCard = ({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: number, status: Order['status']) => void }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800">#{order.id} {order.full_name}</h3>
        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
          {order.weight_kg}kg
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{order.service_type}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-blue-600">₱{order.total_amount}</span>
        <select 
          value={order.status}
          onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
          className="text-xs border border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newOrder, setNewOrder] = useState({
    weight_kg: '',
    service_type: 'Wash & Dry',
    total_amount: ''
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
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return alert('Please select a customer');
    try {
      await api.post('/orders', {
        ...newOrder,
        customer_id: selectedCustomer.id,
        weight_kg: parseFloat(newOrder.weight_kg),
        total_amount: parseFloat(newOrder.total_amount)
      });
      setShowModal(false);
      setSelectedCustomer(null);
      setNewOrder({ weight_kg: '', service_type: 'Wash & Dry', total_amount: '' });
      fetchOrders();
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
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
            onClick={fetchOrders}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh Board
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Order
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {STATUS_COLUMNS.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72">
            <div className={`flex items-center p-3 rounded-t-lg ${column.color} border-b-2 border-white`}>
              <column.icon className="w-5 h-5 mr-2 text-gray-700" />
              <h2 className="font-bold text-gray-800">{column.label}</h2>
              <span className="ml-auto bg-white px-2 py-0.5 rounded text-xs font-bold text-gray-600">
                {orders.filter(o => o.status === column.id).length}
              </span>
            </div>
            <div className="bg-gray-100 p-3 rounded-b-lg min-h-[500px]">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Create New Order</h2>
            <form onSubmit={handleCreateOrder}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Search Customer</label>
                {!selectedCustomer ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                    {customers.length > 0 && customerSearch.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {customers.map(c => (
                          <div 
                            key={c.id} 
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomers([]);
                              setCustomerSearch('');
                            }}
                          >
                            <p className="font-medium text-sm text-gray-800">{c.full_name}</p>
                            <p className="text-xs text-gray-500">{c.phone_number}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-bold text-blue-800 text-sm">{selectedCustomer.full_name}</p>
                      <p className="text-xs text-blue-600">{selectedCustomer.phone_number}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newOrder.weight_kg}
                    onChange={(e) => setNewOrder({ ...newOrder, weight_kg: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Service Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newOrder.service_type}
                    onChange={(e) => setNewOrder({ ...newOrder, service_type: e.target.value })}
                  >
                    <option>Wash & Dry</option>
                    <option>Dry Only</option>
                    <option>Wash Only</option>
                    <option>Comforter/Heavy</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Total Amount (₱)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                  value={newOrder.total_amount}
                  onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
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
