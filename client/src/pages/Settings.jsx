import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Key, LogOut, CheckCircle2, ShieldAlert, X, AlertTriangle, Sparkles } from 'lucide-react';

export default function Settings() {
  const { token, logout } = useAuth();

  // State lists
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Plan Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Plan Form
  const [planName, setPlanName] = useState('');
  const [planDuration, setPlanDuration] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planFormError, setPlanFormError] = useState('');
  const [planActionLoading, setPlanActionLoading] = useState(false);

  // Security Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [token]);

  // Open Add Plan Modal
  const handleOpenAdd = () => {
    setPlanName('');
    setPlanDuration('');
    setPlanPrice('');
    setPlanFormError('');
    setIsAddOpen(true);
  };

  // Open Edit Plan Modal
  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setPlanName(plan.name);
    setPlanDuration(plan.duration_months.toString());
    setPlanPrice(plan.price.toString());
    setPlanFormError('');
    setIsEditOpen(true);
  };

  // Open Delete Plan Modal
  const handleOpenDelete = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  // Submit Add Plan
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setPlanFormError('');

    if (!planName.trim() || !planDuration || !planPrice) {
      setPlanFormError('Please fill in all plan details');
      return;
    }

    setPlanActionLoading(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: planName.trim(),
          duration_months: parseInt(planDuration, 10),
          price: parseFloat(planPrice)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create plan');

      setIsAddOpen(false);
      fetchPlans();
    } catch (err) {
      setPlanFormError(err.message);
    } finally {
      setPlanActionLoading(false);
    }
  };

  // Submit Edit Plan
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPlanFormError('');

    if (!planName.trim() || !planDuration || !planPrice) {
      setPlanFormError('Please fill in all plan details');
      return;
    }

    setPlanActionLoading(true);
    try {
      const res = await fetch(`/api/plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: planName.trim(),
          duration_months: parseInt(planDuration, 10),
          price: parseFloat(planPrice)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update plan');

      setIsEditOpen(false);
      fetchPlans();
    } catch (err) {
      setPlanFormError(err.message);
    } finally {
      setPlanActionLoading(false);
    }
  };

  // Delete Plan
  const handleDeleteConfirm = async () => {
    setPlanActionLoading(true);
    try {
      const res = await fetch(`/api/plans/${selectedPlan.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete plan');

      setIsDeleteOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.message);
    } finally {
      setPlanActionLoading(false);
    }
  };

  // Submit change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setSecurityError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setSecuritySuccess('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityError(err.message);
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">
          SYSTEM <span className="text-gym-accent font-display">SETTINGS</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure pricing plans, security credentials, and access keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Plans configuration panel */}
        <div className="lg:col-span-2 bg-gym-panel border border-gym-border rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gym-border px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-white">MEMBERSHIP PLANS</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Add or edit subscription price packages.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="h-9 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl px-4 flex items-center justify-center space-x-1.5 transition-all duration-150 active:scale-95 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plan</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-6 h-6 border-3 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Loading plans...</p>
            </div>
          ) : error ? (
            <div className="p-5 text-center text-gym-expiredText text-sm bg-red-500 bg-opacity-5">
              {error}
            </div>
          ) : plans.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-gray-600 mb-3" />
              <h4 className="text-sm font-semibold text-white">No Plans Configured</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                To start registering gym members, you must configure at least one membership pricing plan first.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto animate-fadeIn">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#24262E] text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                    <th className="px-5 py-3.5">Plan Name</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24262E] text-sm">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-[#24262E] hover:bg-opacity-25 transition-colors duration-150">
                      <td className="px-5 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-5 py-4 text-gray-300 font-medium">
                        {p.duration_months} {p.duration_months === 1 ? 'Month' : 'Months'}
                      </td>
                      <td className="px-5 py-4 text-gym-accent font-semibold">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Plan"
                            className="w-8 h-8 rounded-lg bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-gray-300 flex items-center justify-center transition-all duration-150 active:scale-90"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(p)}
                            title="Delete Plan"
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
          )}
        </div>

        {/* Security configuration panel */}
        <div className="space-y-6">
          {/* Security Box */}
          <div className="bg-gym-panel border border-gym-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center space-x-3 mb-5 border-b border-[#24262E] pb-3">
              <div className="w-8 h-8 rounded-lg bg-gym-accent bg-opacity-10 text-gym-accent flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">SECURITY CONTROL</h3>
                <p className="text-[10px] text-gray-500">Update admin security credentials.</p>
              </div>
            </div>

            {securityError && (
              <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{securityError}</span>
              </div>
            )}
            {securitySuccess && (
              <div className="mb-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 text-gym-activeText p-3 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Old password"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                />
              </div>
              <button
                type="submit"
                disabled={securityLoading}
                className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl transition-all duration-150 flex items-center justify-center mt-4 disabled:opacity-50 text-xs"
              >
                {securityLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Update Password'}
              </button>
            </form>
          </div>

          {/* System Control logout */}
          <div className="bg-gym-panel border border-gym-border rounded-2xl p-5 shadow-xl">
            <h3 className="font-display font-bold text-white text-sm mb-1">OPERATOR CONTROL</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Logout clears the local token storage and secures the session. Next login requires credentials.
            </p>
            <button
              onClick={logout}
              className="w-full h-11 bg-gym-expiredBg hover:bg-red-600 hover:text-white border border-red-500 border-opacity-10 text-gym-expiredText font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center space-x-2 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Operator</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: ADD PLAN */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-bold text-white mb-5">CREATE PLAN</h3>
            {planFormError && (
              <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{planFormError}</span>
              </div>
            )}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. 3 Months Membership"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Duration (Months)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={planDuration}
                  onChange={(e) => setPlanDuration(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  placeholder="e.g. 3000"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={planActionLoading}
                className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl transition-all duration-150 flex items-center justify-center mt-6 disabled:opacity-50"
              >
                {planActionLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Save Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAN */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-bold text-white mb-5">UPDATE PLAN</h3>
            {planFormError && (
              <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{planFormError}</span>
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Duration (Months)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={planDuration}
                  onChange={(e) => setPlanDuration(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={planActionLoading}
                className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl transition-all duration-150 flex items-center justify-center mt-6 disabled:opacity-50"
              >
                {planActionLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Update Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PLAN */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-25 rounded-full flex items-center justify-center mx-auto mb-4 text-gym-expiredText">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">DELETE PLAN?</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">{selectedPlan?.name}</span>? 
              Associated members will stay in the system but have their active plan set to "No Plan" (unassigned).
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
                disabled={planActionLoading}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center disabled:opacity-50"
              >
                {planActionLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
