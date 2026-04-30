import { useState, useEffect } from 'react';
import api from '../services/api';
import { History, CheckCircle, Package, Search } from 'lucide-react';
import { Order } from '../types';

const CustomerHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const response = await api.get<Order[]>('/orders/my-orders');
        // Show all orders, same as admin view
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching my history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyHistory();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Order History</h1>
      <p className="text-gray-500 mb-8">View all your past and active laundry transactions</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/30">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search by order ID or service type..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-gray-500">Loading your history...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 px-4">
              <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No orders found.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Service</th>
                  <th className="px-6 py-4 font-bold">Weight</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{order.service_type}</td>
                    <td className="px-6 py-4 text-gray-600">{order.weight_kg}kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      ₱{order.total_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistory;
