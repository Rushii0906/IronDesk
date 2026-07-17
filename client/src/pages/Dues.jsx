import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Eye, MessageSquare } from 'lucide-react';

export default function Dues() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dues tracking');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Error loading dues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, [token]);

  const getWhatsAppLink = (m) => {
    const text = `Hi ${m.name}, your gym membership expired on ${m.due_date}. Please drop by the front desk to log a renewal payment. Hope to see you back soon!`;
    return `https://wa.me/${m.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">
          DUES <span className="text-gym-accent font-display">TRACKER</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Audit outstanding balances and expired memberships.</p>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] space-y-3">
          <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Syncing outstanding accounts...</p>
        </div>
      ) : error ? (
        <div className="bg-gym-panel border border-gym-border rounded-xl p-6 text-center text-gym-expiredText">
          {error}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-gym-panel border border-gym-border rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-gym-activeBg text-gym-activeText rounded-full flex items-center justify-center mb-3">
            <Eye className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">No Outstanding Dues</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            All registered gym members currently have clear, active subscriptions.
          </p>
        </div>
      ) : (
        <div className="bg-gym-panel border border-gym-border rounded-xl overflow-hidden shadow-lg animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#24262E] text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  <th className="px-5 py-3.5">Member Name</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Expiration Date</th>
                  <th className="px-5 py-3.5">Days Overdue</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24262E] text-sm">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#24262E] hover:bg-opacity-35 transition-colors duration-150">
                    <td className="px-5 py-4 font-semibold text-white">{m.name}</td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{m.phone}</td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{m.due_date}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gym-expiredBg text-gym-expiredText">
                        {m.days_overdue} Days Overdue
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/app/members/${m.id}`)}
                          title="View Profile"
                          className="w-8 h-8 rounded-lg bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-gray-300 flex items-center justify-center transition-colors duration-150 active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={getWhatsAppLink(m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send WhatsApp Reminder"
                          className="w-8 h-8 rounded-lg bg-gym-expiredBg hover:bg-gym-accent hover:text-black border border-gym-accent border-opacity-10 text-gym-expiredText flex items-center justify-center transition-colors duration-150 active:scale-95"
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
        </div>
      )}
    </div>
  );
}
