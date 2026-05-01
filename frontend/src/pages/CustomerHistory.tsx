import { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search, ShoppingBag } from 'lucide-react';
import { Order } from '../types';

const CustomerHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const response = await api.get<Order[]>('/orders/my-orders');
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
      case 'Washing': return 'bg-blue-100 text-blue-700';
      case 'Drying': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-[#00B5B8]/10 text-[#00B5B8]';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Laundry History</h1>
          <p className="text-gray-500">Track all your previous laundry services</p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <History className="w-6 h-6 text-[#00B5B8]" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center bg-gray-50/30">
          <div className="flex items-center flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-2 group focus-within:ring-2 focus-within:ring-[#00B5B8]/20 transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#00B5B8]" />
            <input 
              type="text" 
              placeholder="Search by Order ID or service..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium text-gray-600 placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your history...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 px-4">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No records found.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#00B5B8]/5 text-[#00B5B8] text-xs uppercase tracking-widest border-b border-[#00B5B8]/10">
                  <th className="px-6 py-5 font-black">Date</th>
                  <th className="px-6 py-5 font-black">Order ID</th>
                  <th className="px-6 py-5 font-black">Service</th>
                  <th className="px-6 py-5 font-black">Weight</th>
                  <th className="px-6 py-5 font-black">Status</th>
                  <th className="px-6 py-5 font-black text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00B5B8]/5 bg-white/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#00B5B8]/5 transition-colors text-sm group">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 group-hover:text-[#00B5B8]/60 transition-colors">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{order.service_type}</td>
                    <td className="px-6 py-4 text-gray-500 font-bold">{order.weight_kg}kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusStyle(order.status)} shadow-sm`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[#00B5B8] whitespace-nowrap text-base">
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
