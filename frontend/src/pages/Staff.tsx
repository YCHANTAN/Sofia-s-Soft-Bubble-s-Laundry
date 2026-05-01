import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, UserPlus, User as UserIcon, ShieldCheck, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { User } from '../types';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const Staff = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [newStaff, setNewStaff] = useState({ 
    username: '', 
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: ''
  });
  const [editStaffData, setEditStaffData] = useState({
    username: '',
    password: '',
    full_name: '',
    phone_number: ''
  });
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      const response = await api.get<User[]>(`/auth/users?role=staff&search=${search}`);
      setStaffList(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStaff();
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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newStaff.password !== newStaff.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const loadingToast = toast.loading('Creating staff account...');
    try {
      await api.post('/auth/register-staff', {
        username: newStaff.username,
        password: newStaff.password,
        full_name: newStaff.full_name,
        phone_number: newStaff.phone_number
      });
      toast.success('Staff account created successfully!', { id: loadingToast });
      setShowModal(false);
      setNewStaff({ username: '', password: '', confirmPassword: '', full_name: '', phone_number: '' });
      fetchStaff();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error creating staff account';
      setError(msg);
      toast.error(msg, { id: loadingToast });
      console.error('Error creating staff:', err);
    }
  };

  const handleEditClick = (staff: User) => {
    setEditingStaff(staff);
    setEditStaffData({
      username: staff.username,
      password: '', // Keep empty unless updating
      full_name: staff.full_name || '',
      phone_number: staff.phone_number || ''
    });
    setShowEditModal(true);
    setOpenDropdownId(null);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!editingStaff) return;

    const loadingToast = toast.loading('Updating staff details...');
    try {
      await api.put(`/auth/staff/${editingStaff.id}`, editStaffData);
      toast.success('Staff details updated!', { id: loadingToast });
      setShowEditModal(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error updating staff account';
      setError(msg);
      toast.error(msg, { id: loadingToast });
      console.error('Error updating staff:', err);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    const loadingToast = toast.loading('Removing staff member...');
    try {
      await api.delete(`/auth/staff/${staffToDelete}`);
      toast.success('Staff member removed.', { id: loadingToast });
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Failed to remove staff member.', { id: loadingToast });
    }
    setStaffToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-500">Add and manage laundry shop staff</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#00B5B8]/10 hover:bg-[#00B5B8]/20 text-[#00B5B8] px-6 py-3 rounded-2xl flex items-center transition-all duration-200 border border-[#00B5B8]/20 font-bold shadow-sm"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-50 flex items-center bg-gray-50/30 rounded-t-[2rem]">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search staff by username or name..." 
            className="flex-1 focus:outline-none bg-transparent font-medium text-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[200px] pb-20">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="px-6 py-3 font-medium">Staff Member</th>
                <th className="px-6 py-3 font-medium">Username</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500">Loading staff...</td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500">No staff members found</td></tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mr-3 font-bold text-lg">
                          {staff.full_name?.charAt(0).toUpperCase() || staff.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{staff.full_name || 'No Name Set'}</p>
                          <p className="text-xs text-gray-500">{staff.phone_number || 'No Phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">@{staff.username}</span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === staff.id ? null : staff.id)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === staff.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 top-10 w-40 z-40 bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg py-1 overflow-hidden animate-in fade-in zoom-in duration-200"
                        >
                          <button 
                            onClick={() => handleEditClick(staff)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#00B5B8]/10 flex items-center transition-colors"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setStaffToDelete(staff.id);
                              setShowDeleteConfirm(true);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-600/10 flex items-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,76,106,0.15)] w-full max-w-[450px] max-h-[90vh] overflow-y-auto border border-white/20 animate-fadeIn">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-[#00B5B8]/10 rounded-2xl flex items-center justify-center mr-4">
                <ShieldCheck className="w-6 h-6 text-[#00B5B8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Staff</h2>
                <p className="text-sm text-gray-500 font-medium">Create a new staff account</p>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}
            <form onSubmit={handleCreateStaff} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={newStaff.full_name} onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={newStaff.phone_number} onChange={(e) => setNewStaff({ ...newStaff, phone_number: e.target.value })} required />
              </div>
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-[#00B5B8] uppercase tracking-widest">Login Credentials</p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Username</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={newStaff.username} onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Password</label>
                  <input type="password" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Confirm Password</label>
                  <input type="password" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={newStaff.confirmPassword} onChange={(e) => setNewStaff({ ...newStaff, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-gray-100">Cancel</button>
                <button type="submit" className="flex-1 bg-[#00B5B8] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#00B5B8]/20">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,76,106,0.15)] w-full max-w-[450px] max-h-[90vh] overflow-y-auto border border-white/20 animate-fadeIn">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-[#00B5B8]/10 rounded-2xl flex items-center justify-center mr-4">
                <Edit2 className="w-6 h-6 text-[#00B5B8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Staff</h2>
                <p className="text-sm text-gray-500 font-medium">Update staff details</p>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}
            <form onSubmit={handleUpdateStaff} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={editStaffData.full_name} onChange={(e) => setEditStaffData({ ...editStaffData, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={editStaffData.phone_number} onChange={(e) => setEditStaffData({ ...editStaffData, phone_number: e.target.value })} required />
              </div>
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-[#00B5B8] uppercase tracking-widest">Login Credentials</p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Username</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={editStaffData.username} onChange={(e) => setEditStaffData({ ...editStaffData, username: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">New Password (leave blank to keep current)</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B5B8]/20 transition-all font-medium" value={editStaffData.password} onChange={(e) => setEditStaffData({ ...editStaffData, password: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-gray-100">Cancel</button>
                <button type="submit" className="flex-1 bg-[#00B5B8] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#00B5B8]/20">Update Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteStaff}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member? This will permanently delete their login account and they will no longer have access to the system."
        confirmText="Remove Staff"
      />
    </div>
  );
};

export default Staff;
