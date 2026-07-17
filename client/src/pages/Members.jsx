import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, Edit2, Trash2, X, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Members() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State lists
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering / Searching state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [selectedMember, setSelectedMember] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Date helper
  const getTodayString = () => {
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset();
    const offsetDate = new Date(localDate.getTime() - (offset * 60 * 1000));
    return offsetDate.toISOString().split('T')[0];
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/members?search=${encodeURIComponent(search)}&status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Error loading members');
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data);
      if (data.length > 0) setPlanId(data[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchPlans()]);
      setLoading(false);
    };
    loadInitialData();
  }, [token, statusFilter]);

  // Handle live search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!loading) fetchMembers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Open add modal
  const handleOpenAdd = () => {
    setName('');
    setPhone('');
    setJoinDate(getTodayString());
    setFormError('');
    if (plans.length > 0) {
      setPlanId(plans[0].id.toString());
    } else {
      setPlanId('');
    }
    setIsAddOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setName(member.name);
    setPhone(member.phone);
    setPlanId(member.plan_id ? member.plan_id.toString() : '');
    setDueDate(member.due_date);
    setFormError('');
    setIsEditOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDelete = (member) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  // Submit new member
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim() || !planId || !joinDate) {
      setFormError('Please fill all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          plan_id: parseInt(planId, 10),
          join_date: joinDate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create member');

      setIsAddOpen(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit edit member
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim() || !planId || !dueDate) {
      setFormError('Please fill all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          plan_id: parseInt(planId, 10),
          due_date: dueDate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update member');

      setIsEditOpen(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete member
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete member');

      setIsDeleteOpen(false);
      fetchMembers();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">
            MEMBER <span className="text-gym-accent font-display">DIRECTORY</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage memberships, updates, and profile views.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl px-5 flex items-center justify-center space-x-2 transition-all duration-150 shadow-[0_4px_12px_rgba(242,169,59,0.25)] self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Directory Search & Filter Bars */}
      <div className="bg-gym-panel border border-gym-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gym-accent transition-colors duration-150"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-[#24262E] border border-gym-border p-1 rounded-xl w-full md:w-auto">
          {['all', 'active', 'expiring', 'expired'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-grow md:flex-none text-xs font-semibold px-4 py-2 rounded-lg uppercase tracking-wider transition-all duration-150 ${
                statusFilter === filter
                  ? 'bg-gym-accent text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid/Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] space-y-3">
          <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Syncing directory...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-gym-panel border border-gym-border rounded-xl p-12 text-center flex flex-col items-center">
          <AlertTriangle className="w-8 h-8 text-gray-600 mb-3" />
          <h4 className="text-base font-semibold text-white">No Members Found</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Try adjusting your search query, status filters, or add a new member.
          </p>
        </div>
      ) : (
        <div className="bg-gym-panel border border-gym-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#24262E] text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Assigned Plan</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Access Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24262E] text-sm">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#24262E] hover:bg-opacity-35 transition-colors duration-150">
                    <td className="px-5 py-4 font-semibold text-white">{member.name}</td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{member.phone}</td>
                    <td className="px-5 py-4 text-gray-300">{member.plan_name}</td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{member.due_date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          member.status === 'active'
                            ? 'bg-gym-activeBg text-gym-activeText'
                            : member.status === 'expiring'
                            ? 'bg-gym-expiringBg text-gym-expiringText'
                            : 'bg-gym-expiredBg text-gym-expiredText'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/app/members/${member.id}`)}
                          title="View Profile"
                          className="w-8 h-8 rounded-lg bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-gray-300 flex items-center justify-center transition-all duration-150 active:scale-90"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(member)}
                          title="Edit Profile"
                          className="w-8 h-8 rounded-lg bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-gray-300 flex items-center justify-center transition-all duration-150 active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(member)}
                          title="Delete Member"
                          className="w-8 h-8 rounded-lg bg-gym-expiredBg hover:bg-red-600 hover:text-white border border-red-500 border-opacity-10 text-gym-expiredText flex items-center justify-center transition-all duration-150 active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-bold text-white mb-5">ADD NEW MEMBER</h3>
            {formError && (
              <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Member Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9999999999"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Membership Plan</label>
                {plans.length === 0 ? (
                  <p className="text-xs text-gym-expiredText bg-red-500 bg-opacity-5 p-2 rounded-lg border border-red-500 border-opacity-10">
                    No membership plans configured. Please create a plan in settings first.
                  </p>
                ) : (
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.duration_months}m - ₹{p.price})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Join Date</label>
                <input
                  type="date"
                  required
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading || plans.length === 0}
                className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl transition-all duration-150 flex items-center justify-center mt-6 disabled:opacity-50"
              >
                {actionLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Save Member'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-bold text-white mb-5">EDIT MEMBER PROFILE</h3>
            {formError && (
              <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Member Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Membership Plan</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                >
                  <option value="">No Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Due Date (Override)</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl transition-all duration-150 flex items-center justify-center mt-6 disabled:opacity-50"
              >
                {actionLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Update Member'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-25 rounded-full flex items-center justify-center mx-auto mb-4 text-gym-expiredText">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">DELETE MEMBER?</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">{selectedMember?.name}</span>? This action is permanent and will cascade-delete their entire payment log history.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 h-11 bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-white font-semibold rounded-xl transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center disabled:opacity-50"
              >
                {actionLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
