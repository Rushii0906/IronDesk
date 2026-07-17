import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Key, AlertTriangle } from 'lucide-react';

export default function SetupPage() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Admin name is required');
      return;
    }
    if (!pin) {
      setError('Access PIN is required');
      return;
    }
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be 4 to 6 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      await setup(name.trim(), pin);
    } catch (err) {
      setError(err.message || 'Setup initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15161A] flex flex-col justify-center items-center px-4 font-sans selection:bg-gym-accent selection:text-black">
      <div className="w-full max-w-md bg-[#1D1F25] border border-[#33353E] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gym-accent rounded-full opacity-60"></div>

        {/* Brand/Setup Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center border border-gym-accent border-opacity-35 mb-3">
            <ShieldCheck className="w-6 h-6 text-gym-accent" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-wider">
            IRON<span className="text-gym-accent">DESK SETUP</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 px-4 leading-relaxed">
            Welcome! Create the primary administrator and set the shared front desk access PIN to get started.
          </p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText rounded-xl p-3 flex items-center space-x-2 text-sm justify-center mb-5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
              Owner / Admin Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full h-12 bg-[#24262E] border border-[#33353E] rounded-xl pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gym-accent transition-colors duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
              Access PIN (4-6 digits)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="password"
                pattern="\d*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1234"
                className="w-full h-12 bg-[#24262E] border border-[#33353E] rounded-xl pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gym-accent transition-colors duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
              Confirm Access PIN
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="password"
                pattern="\d*"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Repeat PIN"
                className="w-full h-12 bg-[#24262E] border border-[#33353E] rounded-xl pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gym-accent transition-colors duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-gym-accent hover:bg-gym-accentHover disabled:opacity-50 text-black font-semibold rounded-xl transition-all duration-150 shadow-[0_4px_12px_rgba(242,169,59,0.25)] flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Complete Initialization'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
