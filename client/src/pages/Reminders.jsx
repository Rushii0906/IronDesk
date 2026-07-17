import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Eye, MessageSquare, AlertCircle } from 'lucide-react';

export default function Reminders() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [days, setDays] = useState(7);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Error loading reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [days, token]);

  const getWhatsAppLink = (m) => {
    const text = `Hi ${m.name}, this is a friendly reminder that your gym membership is expiring soon on ${m.due_date}. Please renew at the front desk to continue training. Thanks!`;
    return `https://wa.me/${m.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">
            EXPIRY <span className="text-gym-accent font-display">REMINDERS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Nudge expiring memberships before access is blocked.</p>
        </div>

        {/* Toggle Range */}
        <div className="flex bg-[#24262E] border border-gym-border p-1 rounded-xl">
          {[7, 15, 30].map((t) => (
            <button
              key={t}
              onClick={() => setDays(t)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 uppercase tracking-wider ${
                days === t
                  ? 'bg-gym-accent text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t} Days
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] space-y-3">
          <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Syncing reminders...</p>
        </div>
      ) : error ? (
        <div className="bg-gym-panel border border-gym-border rounded-xl p-6 text-center text-gym-expiredText">
          {error}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-gym-panel border border-gym-border rounded-xl p-12 text-center flex flex-col items-center">
          <Clock className="w-8 h-8 text-gray-600 mb-3" />
          <h4 className="text-sm font-semibold text-white">All Clear</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            No memberships are expiring within the next {days} days.
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
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Days Left</th>
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
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gym-expiringBg text-gym-expiringText">
                        {m.days_left} Days Left
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
        </div>
      )}
    </div>
  );
}
