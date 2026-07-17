import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, AlertTriangle, DollarSign, Eye, MessageSquare, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // WhatsApp quick text link helper
  const getWhatsAppLink = (member) => {
    const text = member.status === 'expired'
      ? `Hi ${member.name}, your membership at IronDesk has expired. Please drop by the front desk to renew it. Thanks!`
      : `Hi ${member.name}, your membership at IronDesk is expiring soon on ${member.due_date}. Please renew it to enjoy uninterrupted access. Thanks!`;
    return `https://wa.me/${member.phone}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
        <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText rounded-xl p-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-gym-expiredText" />
        <h3 className="font-semibold text-white">Connection Failure</h3>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <button 
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="mt-3 px-4 py-1.5 bg-red-500 bg-opacity-20 hover:bg-opacity-30 border border-red-500 rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Active Members',
      value: data?.activeCount || 0,
      icon: Users,
      colorClass: 'bg-gym-activeBg text-gym-activeText',
      desc: 'Access cleared'
    },
    {
      label: 'Expiring Soon',
      value: data?.expiringCount || 0,
      icon: Clock,
      colorClass: 'bg-gym-expiringBg text-gym-expiringText',
      desc: '0 to 7 days left'
    },
    {
      label: 'Expired Members',
      value: data?.expiredCount || 0,
      icon: AlertTriangle,
      colorClass: 'bg-gym-expiredBg text-gym-expiredText',
      desc: 'Access blocked'
    },
    {
      label: "Month's Revenue",
      value: `₹${(data?.monthlyRevenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      colorClass: 'bg-gym-accent bg-opacity-10 text-gym-accent border border-gym-accent border-opacity-20',
      desc: 'Collected this month'
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">
          OPERATIONS <span className="text-gym-accent font-display">DASHBOARD</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Real-time health and access check metrics.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div 
              key={idx}
              className="bg-gym-panel border border-gym-border rounded-xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {m.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-display font-bold text-white">
                  {m.value}
                </p>
                <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider mt-1">
                  {m.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attention / Action List */}
      <div className="bg-gym-panel border border-gym-border rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gym-border px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white">ATTENTION REQUIRED</h2>
            <p className="text-xs text-gray-500 mt-0.5">Expiring soon and expired memberships.</p>
          </div>
          <span className="text-xs font-bold bg-[#24262E] text-gym-accent px-2.5 py-1 rounded-full border border-gym-border">
            {data?.attentionList?.length || 0} Alerts
          </span>
        </div>

        {data?.attentionList?.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <Users className="w-8 h-8 text-gray-600 mb-3" />
            <h4 className="text-sm font-semibold text-white">No Action Required</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              All gym members currently have active and clear access.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#24262E] text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Remaining</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24262E] text-sm">
                {data?.attentionList?.map((m) => (
                  <tr key={m.id} className="hover:bg-[#24262E] hover:bg-opacity-35 transition-colors duration-150">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{m.name}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{m.phone}</td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{m.due_date}</td>
                    <td className="px-5 py-4">
                      <span 
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'expired'
                            ? 'bg-gym-expiredBg text-gym-expiredText border border-red-500 border-opacity-10'
                            : 'bg-gym-expiringBg text-gym-expiringText border border-gym-accent border-opacity-10'
                        }`}
                      >
                        {m.status === 'expired' 
                          ? `${Math.abs(m.days_left)} days overdue` 
                          : `${m.days_left} days left`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Profile Button */}
                        <button
                          onClick={() => navigate(`/app/members/${m.id}`)}
                          title="View Profile"
                          className="w-8 h-8 rounded-lg bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-gray-300 flex items-center justify-center transition-colors duration-150 active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* WhatsApp Reminder Button */}
                        <a
                          href={getWhatsAppLink(m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send WhatsApp Reminder"
                          className="w-8 h-8 rounded-lg bg-gym-expiringBg hover:bg-gym-accent hover:text-black border border-gym-accent border-opacity-10 text-gym-accent flex items-center justify-center transition-colors duration-150 active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
