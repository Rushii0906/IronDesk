import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MessageSquare, ShieldAlert, CreditCard, Plus, Calendar, Clock, CheckCircle2, Phone, Sparkles } from 'lucide-react';

export default function MemberDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Renewal Modal
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi'); // default
  const [renewError, setRenewError] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);

  const fetchMemberDetails = async () => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Member not found');
      const data = await res.json();
      setMember(data.member);
      setPayments(data.payments);
      if (data.member.plan_id) {
        setPlanId(data.member.plan_id.toString());
      }
    } catch (err) {
      setError(err.message || 'Error loading profile');
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      await Promise.all([fetchMemberDetails(), fetchPlans()]);
      setLoading(false);
    };
    loadProfileData();
  }, [id, token]);

  // Update pre-filled amount when plan changes
  useEffect(() => {
    if (planId && plans.length > 0) {
      const selectedPlan = plans.find(p => p.id.toString() === planId);
      if (selectedPlan) {
        setAmount(selectedPlan.price.toString());
      }
    }
  }, [planId, plans]);

  // Message template builders
  const getMessageText = () => {
    if (!member) return '';
    if (member.status === 'expired') {
      return `Hi ${member.name}, your membership at IronDesk expired on ${member.due_date}. Please renew at the front desk to continue training. Thanks!`;
    }
    if (member.status === 'expiring') {
      return `Hi ${member.name}, this is a friendly reminder that your gym membership is expiring soon on ${member.due_date}. Please renew at the front desk to continue training. Thanks!`;
    }
    return `Hi ${member.name}, thank you for training with us! Just a note that your membership is active until ${member.due_date}. See you at the gym!`;
  };

  const handleWhatsApp = () => {
    if (!member) return;
    const url = `https://wa.me/${member.phone}?text=${encodeURIComponent(getMessageText())}`;
    window.open(url, '_blank');
  };

  const handleSMS = () => {
    if (!member) return;
    const url = `sms:${member.phone}?body=${encodeURIComponent(getMessageText())}`;
    window.open(url);
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setRenewError('');

    if (!planId || !amount || !method) {
      setRenewError('Please fill in all details');
      return;
    }

    setRenewLoading(true);
    try {
      const res = await fetch(`/api/members/${id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: parseInt(planId, 10),
          amount: parseFloat(amount),
          method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Renewal failed');

      setIsRenewOpen(false);
      fetchMemberDetails(); // reload profile & payment logs
    } catch (err) {
      setRenewError(err.message);
    } finally {
      setRenewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Syncing profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gym-panel border border-gym-border rounded-xl p-8 max-w-md mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-gym-expiredText" />
        <h3 className="font-semibold text-white">Profile Sync Failed</h3>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button 
          onClick={() => navigate('/app/members')}
          className="mt-4 px-4 py-2 bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border rounded-xl text-xs font-semibold text-white"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Back button */}
      <Link 
        to="/app/members" 
        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-150 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      {/* Member Details Panel */}
      <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gym-accent rounded-full opacity-5 blur-[80px]"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#24262E] border border-gym-border flex items-center justify-center text-gym-accent text-3xl font-display font-bold">
              {member?.name ? member.name.charAt(0).toUpperCase() : ''}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-display font-bold text-white tracking-wide">{member?.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member?.status === 'active'
                      ? 'bg-gym-activeBg text-gym-activeText border border-green-500 border-opacity-10'
                      : member?.status === 'expiring'
                      ? 'bg-gym-expiringBg text-gym-expiringText border border-gym-accent border-opacity-10'
                      : 'bg-gym-expiredBg text-gym-expiredText border border-red-500 border-opacity-10'
                  }`}
                >
                  {member?.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-400 mt-2 gap-4">
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-mono text-gray-300">{member?.phone}</span>
                </span>
                <span className="hidden sm:inline text-gray-600">|</span>
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Joined {member?.join_date}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleWhatsApp}
              className="h-11 bg-[#25D366] bg-opacity-10 hover:bg-opacity-20 border border-[#25D366] border-opacity-25 text-[#25D366] font-semibold rounded-xl px-4 flex items-center justify-center space-x-2 transition-all duration-150 active:scale-95 text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleSMS}
              className="h-11 bg-blue-500 bg-opacity-10 hover:bg-opacity-20 border border-blue-500 border-opacity-25 text-blue-400 font-semibold rounded-xl px-4 flex items-center justify-center space-x-2 transition-all duration-150 active:scale-95 text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => setIsRenewOpen(true)}
              className="h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl px-5 flex items-center justify-center space-x-2 transition-all duration-150 shadow-[0_4px_12px_rgba(242,169,59,0.25)] active:scale-95 text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Log Payment & Renew</span>
            </button>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 border-t border-[#24262E] pt-6">
          <div className="bg-[#24262E] rounded-xl p-4 border border-gym-border flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gym-accent bg-opacity-5 flex items-center justify-center text-gym-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active Plan</p>
              <p className="text-sm font-semibold text-white mt-0.5">{member?.plan_name}</p>
            </div>
          </div>

          <div className="bg-[#24262E] rounded-xl p-4 border border-gym-border flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              member?.status === 'expired' ? 'bg-gym-expiredBg text-gym-expiredText' : 'bg-gym-activeBg text-gym-activeText'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Expiry / Due Date</p>
              <p className="text-sm font-semibold text-white mt-0.5 font-mono">{member?.due_date}</p>
            </div>
          </div>

          <div className="bg-[#24262E] rounded-xl p-4 border border-gym-border flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              member?.status === 'expired' ? 'bg-gym-expiredBg text-gym-expiredText' : 'bg-gym-activeBg text-gym-activeText'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Days Remaining</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {member?.days_left < 0 
                  ? `${Math.abs(member.days_left)} days overdue` 
                  : `${member?.days_left} days left`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Panel */}
      <div className="bg-gym-panel border border-gym-border rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gym-border px-5 py-4">
          <h2 className="text-lg font-display font-bold text-white tracking-wide">PAYMENT HISTORY</h2>
          <p className="text-xs text-gray-500 mt-0.5">Auditable record of all logs and subscription receipts.</p>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CreditCard className="w-8 h-8 text-gray-600 mb-3" />
            <h4 className="text-sm font-semibold text-white">No Payments Recorded</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
              No transactions have been recorded for this member. Click "Log Payment & Renew" to add a renewal ledger entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#24262E] text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  <th className="px-5 py-3.5">Payment Date</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24262E] text-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#24262E] hover:bg-opacity-20 transition-colors duration-150">
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{p.date}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-0.5 bg-[#24262E] border border-gym-border text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gym-accent font-semibold">₹{p.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: LOG PAYMENT & RENEW */}
      {isRenewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsRenewOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-bold text-white mb-5">LOG RENEWAL PAYMENT</h3>
            {renewError && (
              <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{renewError}</span>
              </div>
            )}
            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Select Extension Plan</label>
                {plans.length === 0 ? (
                  <p className="text-xs text-gym-expiredText">No plans available.</p>
                ) : (
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.duration_months} Months - ₹{p.price})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Paid Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gym-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['upi', 'cash', 'card'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`h-11 rounded-xl text-xs font-bold uppercase border tracking-wider transition-all duration-150 ${
                        method === m
                          ? 'bg-gym-accent border-gym-accent text-black'
                          : 'bg-[#24262E] border-[#33353E] text-gray-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={renewLoading || plans.length === 0}
                className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl transition-all duration-150 flex items-center justify-center mt-6 disabled:opacity-50"
              >
                {renewLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Confirm Payment & Renew'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
