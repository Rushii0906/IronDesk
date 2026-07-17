import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your access PIN');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(pin);
    } catch (err) {
      setError(err.message || 'Invalid access PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15161A] flex flex-col justify-center items-center px-4 font-sans selection:bg-gym-accent selection:text-black">
      <div className="w-full max-w-md bg-[#1D1F25] border border-[#33353E] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gym-accent rounded-full opacity-60"></div>

        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center border border-gym-accent border-opacity-35 mb-3">
            <KeyRound className="w-6 h-6 text-gym-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wider">
            IRON<span className="text-gym-accent">DESK</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Gym Operations Console</p>
        </div>

        {/* PIN Display */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Enter Access PIN
            </label>
            <div className="flex justify-center items-center space-x-3 mt-1 h-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                    i < pin.length
                      ? 'bg-gym-accent border-gym-accent scale-110 shadow-[0_0_8px_#F2A93B]'
                      : 'border-gray-600 bg-transparent'
                  }`}
                />
              ))}
            </div>
            
            {/* Real Hidden/Accessible input field for keyboard users */}
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                setError('');
              }}
              className="sr-only"
              autoFocus
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-gym-expiredText rounded-xl p-3 flex items-center space-x-2 text-sm justify-center">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Touch Pad Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num.toString())}
                className="h-14 rounded-xl bg-[#24262E] hover:bg-[#2C2E37] border border-[#33353E] text-white text-xl font-display font-semibold transition-colors duration-150 active:scale-95 flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-xl bg-[#24262E] hover:bg-[#2C2E37] border border-[#33353E] text-gray-400 text-xs font-semibold uppercase transition-colors duration-150 active:scale-95 flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-xl bg-[#24262E] hover:bg-[#2C2E37] border border-[#33353E] text-white text-xl font-display font-semibold transition-colors duration-150 active:scale-95 flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-xl bg-[#24262E] hover:bg-[#2C2E37] border border-[#33353E] text-gray-400 text-xs font-semibold uppercase transition-colors duration-150 active:scale-95 flex items-center justify-center"
            >
              Delete
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gym-accent hover:bg-gym-accentHover disabled:opacity-50 text-black font-semibold rounded-xl transition-all duration-150 shadow-[0_4px_12px_rgba(242,169,59,0.25)] flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
      <p className="text-gray-500 text-xs mt-6">
        Tip: You can also use your physical keyboard to enter numbers.
      </p>
    </div>
  );
}
