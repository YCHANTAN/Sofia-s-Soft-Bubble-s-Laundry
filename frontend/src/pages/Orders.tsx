import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, Search, Filter, Download } from 'lucide-react';
import { Order } from '../types';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Washing': return 'bg-blue-100 text-blue-700';
      case 'Drying': return 'bg-indigo-100 text-indigo-700';
      case 'Completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Service', 'Weight (kg)', 'Amount (₱)', 'Status', 'Date'];
    const csvData = filteredOrders.map(order => [
      order.id,
      order.full_name,
      order.service_type,
      order.weight_kg,
      order.total_amount,
      order.status,
      new Date(order.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Transactions</h1>
          <p className="text-gray-500">View and manage all laundry service records</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center flex-1 min-w-[300px] bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by ID, customer name, or service..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Washing">Washing</option>
              <option value="Drying">Drying</option>
              <option value="Ready">Ready</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading all orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 px-4">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No matching orders found.</p>
              <button 
                onClick={() => {setSearchTerm(''); setStatusFilter('All');}}
                className="text-blue-600 text-sm mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Service</th>
                  <th className="px-6 py-4 font-bold">Weight</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{order.full_name}</p>
                        <p className="text-xs text-gray-500">{order.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.service_type}</td>
                    <td className="px-6 py-4 text-gray-600">{order.weight_kg}kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600 whitespace-nowrap">
                      ₱{order.total_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50/50">
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-medium text-gray-500 text-sm">Total Selected Revenue:</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700 text-base">
                    ₱{filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
