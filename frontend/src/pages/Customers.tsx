import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, UserPlus, Phone, User as UserIcon, Trash2, History, X, MoreVertical, Edit } from 'lucide-react';
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
          className="bg-[#8B4C6A]/10 hover:bg-[#8B4C6A]/20 text-[#8B4C6A] px-6 py-3 rounded-2xl flex items-center transition-all duration-200 border border-[#8B4C6A]/20 font-bold shadow-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[700px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Order History: {selectedCustomer.full_name}</h2>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {loadingHistory ? (
                <p className="text-center py-10 text-gray-500">Loading history...</p>
              ) : customerOrders.length === 0 ? (
                <p className="text-center py-10 text-gray-500">No orders found for this customer.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-600 text-xs uppercase">
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Service</th>
                      <th className="px-4 py-2 font-medium">Weight</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="text-sm">
                        <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{order.service_type}</td>
                        <td className="px-4 py-3 text-gray-600">{order.weight_kg}kg</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-brand/10 text-brand'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-brand">₱{order.total_amount}</td>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-[450px] max-h-[90vh] overflow-y-auto border border-[#8B4C6A]/10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-[#8B4C6A]/10 rounded-2xl flex items-center justify-center mr-4">
                <UserPlus className="w-6 h-6 text-[#8B4C6A]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Register Customer</h2>
                <p className="text-sm text-gray-500 font-medium">Add a new client to the system</p>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}
            
            <form onSubmit={handleCreateCustomer} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#8B4C6A] transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 focus:bg-white transition-all font-medium"
                    placeholder="e.g. Juan Dela Cruz"
                    value={newCustomer.full_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#8B4C6A] transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 focus:bg-white transition-all font-medium"
                    placeholder="e.g. 09123456789"
                    value={newCustomer.phone_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-[#8B4C6A] uppercase tracking-widest">Login Credentials</p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 transition-all font-medium"
                    value={newCustomer.username}
                    onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 transition-all font-medium"
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 transition-all font-medium"
                    value={newCustomer.confirmPassword}
                    onChange={(e) => setNewCustomer({ ...newCustomer, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8B4C6A] text-white font-bold py-4 rounded-2xl hover:bg-[#8B4C6A]/90 transition-all shadow-lg shadow-[#8B4C6A]/20"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-[450px] border border-[#8B4C6A]/10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-[#8B4C6A]/10 rounded-2xl flex items-center justify-center mr-4">
                <Edit className="w-6 h-6 text-[#8B4C6A]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Customer</h2>
                <p className="text-sm text-gray-500 font-medium">Update profile information</p>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}
            
            <form onSubmit={handleUpdateCustomer} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#8B4C6A] transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 focus:bg-white transition-all font-medium"
                    value={editingCustomer.full_name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#8B4C6A] transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 focus:bg-white transition-all font-medium"
                    value={editingCustomer.phone_number}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-[#8B4C6A] uppercase tracking-widest">Security</p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 transition-all font-medium"
                    value={editingCustomer.username}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Change Password</label>
                  <p className="text-[10px] text-gray-400 mb-2 ml-1 italic">Leave blank to keep current password</p>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4C6A]/20 transition-all font-medium"
                    placeholder="New password"
                    value={editingCustomer.password || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8B4C6A] text-white font-bold py-4 rounded-2xl hover:bg-[#8B4C6A]/90 transition-all shadow-lg shadow-[#8B4C6A]/20"
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
