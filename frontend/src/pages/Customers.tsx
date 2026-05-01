import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, UserPlus, Phone, User as UserIcon, Trash2, History, X, MoreVertical, Edit, ShoppingBag } from 'lucide-react';
import { Customer, Order } from '../types';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<{ id: number; full_name: string; phone_number: string; username: string; password?: string } | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [newCustomer, setNewCustomer] = useState({ 
    full_name: '', 
    phone_number: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await api.get<Customer[]>(`/customers?search=${search}`);
      setCustomers(response.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newCustomer.password !== newCustomer.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/customers', newCustomer);
      setShowModal(false);
      setNewCustomer({ 
        full_name: '', 
        phone_number: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating customer');
      console.error('Error creating customer:', err);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setError('');

    try {
      await api.put(`/customers/${editingCustomer.id}`, {
        full_name: editingCustomer.full_name,
        phone_number: editingCustomer.phone_number,
        password: editingCustomer.password
      });
      setShowEditModal(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating customer');
      console.error('Error updating customer:', err);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    setOpenDropdownId(null);
    if (!window.confirm('Are you sure you want to delete this customer? All associated orders and their login account will be removed.')) return;
    
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer');
    }
  };

  const handleViewHistory = async (customer: Customer) => {
    setOpenDropdownId(null);
    setSelectedCustomer(customer);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const response = await api.get<Order[]>(`/customers/${customer.id}/orders`);
      setCustomerOrders(response.data);
    } catch (err) {
      console.error('Error fetching customer history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-500">View and register shop customers</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#00B5B8]/10 hover:bg-[#00B5B8]/20 text-[#00B5B8] px-6 py-3 rounded-2xl flex items-center transition-all duration-200 border border-[#00B5B8]/20 font-bold shadow-sm"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Register Customer
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center bg-gray-50/30">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            className="flex-1 focus:outline-none bg-transparent font-medium text-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone Number</th>
                <th className="px-6 py-3 font-medium">Registered Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No customers found</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center mr-3 font-bold">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{customer.full_name}</p>
                          <p className="text-xs text-gray-500">@{customer.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{customer.phone_number}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === customer.id ? null : customer.id)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === customer.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 top-10 w-48 z-40 bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg py-1 overflow-hidden animate-in fade-in zoom-in duration-200"
                        >
                          <button 
                            onClick={() => handleViewHistory(customer)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand/10 hover:text-brand flex items-center transition-colors"
                          >
                            <History className="w-4 h-4 mr-2" />
                            View History
                          </button>
                          <button 
                            onClick={() => {
                              setEditingCustomer({
                                id: customer.id,
                                full_name: customer.full_name,
                                phone_number: customer.phone_number,
                                username: customer.username || ''
                              });
                              setShowEditModal(true);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand/10 hover:text-brand flex items-center transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Info
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-600/10 flex items-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-white/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHistoryModal(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,76,106,0.15)] w-full max-w-[700px] max-h-[85vh] flex flex-col border border-white/20 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mr-4">
                  <History className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  <p className="text-sm text-gray-500 font-medium">{selectedCustomer.full_name}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
              {loadingHistory ? (
                <div className="text-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading history...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No orders found for this customer.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-[#00B5B8] text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4 font-bold text-gray-800">{order.service_type}</td>
                        <td className="px-4 py-4 text-gray-600 font-medium">{order.weight_kg}kg</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-brand/10 text-brand'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-black text-brand">₱{order.total_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-white/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-md p-7 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,76,106,0.15)] w-full max-w-[420px] mb-12 border border-white/20 animate-fadeIn custom-scrollbar">
            <div className="flex items-center mb-6">
              <div className="w-11 h-11 bg-[#00B5B8]/10 rounded-2xl flex items-center justify-center mr-4">
                <UserPlus className="w-5 h-5 text-[#00B5B8]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register Customer</h2>
                <p className="text-xs text-gray-500 font-medium">Add a new client to the system</p>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 text-xs font-medium border border-red-100">{error}</div>}
            
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-3 h-4 w-4 text-gray-400 group-focus-within:text-[#00B5B8] transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Juan Dela Cruz"
                      value={newCustomer.full_name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#00B5B8] transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 focus:bg-white transition-all font-medium"
                      placeholder="e.g. 09123456789"
                      value={newCustomer.phone_number}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50/50 rounded-[1.5rem] p-5 border border-gray-100 space-y-3">
                <p className="text-[10px] font-black text-[#00B5B8] uppercase tracking-widest mb-1">Account Security</p>
                <div>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all text-sm font-medium"
                    placeholder="Username"
                    value={newCustomer.username}
                    onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all text-sm font-medium"
                    placeholder="Password"
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all text-sm font-medium"
                    placeholder="Confirm"
                    value={newCustomer.confirmPassword}
                    onChange={(e) => setNewCustomer({ ...newCustomer, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00B5B8] text-white font-bold py-3.5 rounded-xl hover:bg-[#00B5B8]/90 transition-all shadow-lg shadow-[#00B5B8]/20 text-sm"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-white/20 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowEditModal(false);
              setEditingCustomer(null);
            }}
          />
          <div className="relative bg-white/95 backdrop-blur-md p-7 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,76,106,0.15)] w-full max-w-[420px] max-h-[90vh] overflow-y-auto border border-white/20 animate-fadeIn custom-scrollbar">
            <div className="flex items-center mb-6">
              <div className="w-11 h-11 bg-[#00B5B8]/10 rounded-2xl flex items-center justify-center mr-4">
                <Edit className="w-5 h-5 text-[#00B5B8]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
                <p className="text-xs text-gray-500 font-medium">Update profile information</p>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 text-xs font-medium border border-red-100">{error}</div>}
            
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-3 h-4 w-4 text-gray-400 group-focus-within:text-[#00B5B8] transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 focus:bg-white transition-all text-sm font-medium"
                    value={editingCustomer.full_name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3 h-4 w-4 text-gray-400 group-focus-within:text-[#00B5B8] transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 focus:bg-white transition-all text-sm font-medium"
                    value={editingCustomer.phone_number}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-[1.5rem] p-5 border border-gray-100 space-y-3">
                <p className="text-[10px] font-black text-[#00B5B8] uppercase tracking-widest mb-1">Security Update</p>
                <div>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all text-sm font-medium"
                    placeholder="Username"
                    value={editingCustomer.username}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all text-sm font-medium"
                    placeholder="New password (leave blank to keep)"
                    value={editingCustomer.password || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00B5B8] text-white font-bold py-3.5 rounded-xl hover:bg-[#00B5B8]/90 transition-all shadow-lg shadow-[#00B5B8]/20 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
