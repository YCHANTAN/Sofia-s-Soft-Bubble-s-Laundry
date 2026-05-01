import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, Clock, CheckCircle, Package } from 'lucide-react';
import { Order } from '../types';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await api.get<Order[]>('/orders/my-orders');
        // Filter for only active orders (not completed)
        const activeOrders = response.data.filter(o => o.status !== 'Completed');
        setOrders(activeOrders);
      } catch (err) {
        console.error('Error fetching my orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const handleCompleteOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you have picked up your laundry? This will mark the order as Completed.')) return;
    
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'Completed' });
      // Update local state to remove the completed order from active view
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error completing order:', err);
      alert('Failed to update order status. Please try again or contact staff.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Washing': return <Clock className="w-5 h-5 text-brand" />;
      case 'Drying': return <Clock className="w-5 h-5 text-purple-500" />;
      case 'Ready': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Completed': return <Package className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Laundry Orders</h1>
      <p className="text-gray-500 mb-8">Track the status of your laundry in real-time</p>

      <div className="grid gap-6">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No active orders</h3>
            <p className="text-gray-500">When you drop off laundry, it will appear here!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mr-4">
                  <ShoppingBag className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{order.service_type}</h3>
                  <p className="text-sm text-gray-500">{order.weight_kg}kg • Registered on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                {order.status === 'Ready' && (
                  <button 
                    onClick={() => handleCompleteOrder(order.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Mark as Picked Up
                  </button>
                )}
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center font-bold">
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{order.status}</span>
                  </div>
                </div>
                <div className="text-right border-l pl-8">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="font-bold text-lg text-brand">₱{order.total_amount}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
