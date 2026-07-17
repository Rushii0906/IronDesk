import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, ShieldCheck, Zap, ArrowRight, Users, Check, Smartphone, Circle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gym-bg text-gray-100 font-sans selection:bg-gym-accent selection:text-black">
      
      {/* 1. Header / Navbar */}
      <header className="border-b border-gym-border bg-gym-bg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center border border-gym-accent border-opacity-30">
              <ShieldCheck className="w-5 h-5 text-gym-accent" />
            </div>
            <span className="text-xl font-display font-bold tracking-wider text-white">
              IRON<span className="text-gym-accent font-display">DESK</span>
            </span>
          </div>
          <Link 
            to="/app"
            className="h-10 px-5 border border-gym-border hover:border-gym-accent bg-[#1D1F25] hover:bg-gym-accent hover:text-black font-semibold rounded-xl text-sm flex items-center justify-center transition-all duration-150 active:scale-95 text-white"
          >
            Launch Console
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gym-accent bg-opacity-10 border border-gym-accent border-opacity-25 px-3 py-1.5 rounded-full text-gym-accent text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Operational Excellence</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] max-w-2xl mx-auto lg:mx-0">
            Ditch paper logs.<br/>
            Track <span className="text-gym-accent font-display">gym memberships</span> in real-time.
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            IronDesk replaces paper registers at your gym front desk. Log payments, track expiring accounts instantly, and send WhatsApp renewal alerts in one click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link
              to="/app"
              className="w-full sm:w-auto h-12 bg-gym-accent hover:bg-gym-accentHover text-black font-bold rounded-xl px-8 flex items-center justify-center space-x-2 transition-all duration-150 shadow-[0_4px_16px_rgba(242,169,59,0.3)] active:scale-95"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto h-12 border border-gym-border hover:border-gray-500 bg-transparent hover:bg-gym-panel text-gray-300 font-semibold rounded-xl px-6 flex items-center justify-center transition-colors duration-150 active:scale-95"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Hero Image Mockup Area */}
        <div className="hidden lg:block lg:col-span-6 relative">
          <div className="absolute inset-0 bg-gym-accent rounded-full opacity-5 blur-[120px] -z-10"></div>
          {/* Main App Window Mockup */}
          <div className="bg-[#1D1F25] border border-gym-border rounded-2xl shadow-2xl p-6 relative overflow-hidden transform rotate-2 translate-x-4 max-w-lg mx-auto">
            {/* Window bar */}
            <div className="flex items-center space-x-1.5 mb-5 border-b border-[#24262E] pb-3">
              <Circle className="w-3 h-3 text-red-500 fill-red-500" />
              <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Circle className="w-3 h-3 text-green-500 fill-green-500" />
              <span className="text-[10px] text-gray-500 font-mono pl-4">app.irondesk.co/#/app/dashboard</span>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#24262E] border border-gym-border p-3 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Active</span>
                  <p className="text-xl font-display font-bold text-white mt-1">42</p>
                </div>
                <div className="bg-[#24262E] border border-gym-border p-3 rounded-xl border-gym-accent border-opacity-30">
                  <span className="text-[9px] font-bold text-gym-accent uppercase tracking-wide">Expiring</span>
                  <p className="text-xl font-display font-bold text-gym-accent mt-1">3</p>
                </div>
                <div className="bg-[#24262E] border border-gym-border p-3 rounded-xl">
                  <span className="text-[9px] font-bold text-gym-expiredText uppercase tracking-wide">Expired</span>
                  <p className="text-xl font-display font-bold text-gym-expiredText mt-1">5</p>
                </div>
              </div>

              {/* Mockup Table */}
              <div className="bg-[#24262E] rounded-xl border border-gym-border p-3 space-y-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Attention Required</p>
                <div className="flex items-center justify-between text-xs border-b border-gym-border pb-2 mt-1">
                  <div>
                    <p className="font-semibold text-white">Jack Anderson</p>
                    <p className="text-[10px] text-gray-500 font-mono">9988776655</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gym-expiredBg text-gym-expiredText text-[9px] font-bold uppercase rounded-full">
                    3 Days Overdue
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <p className="font-semibold text-white">Sarah Jenkins</p>
                    <p className="text-[10px] text-gray-500 font-mono">9977886655</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gym-expiringBg text-gym-accent text-[9px] font-bold uppercase rounded-full">
                    2 Days Left
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights Section */}
      <section className="bg-gym-panel border-y border-gym-border py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-display font-bold text-white tracking-wide">
              DESIGNED FOR THE <span className="text-gym-accent font-display">FRONT DESK</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              No complex ERP setups. Just clean tools to audit, renew, and secure your memberships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#24262E] border border-gym-border rounded-2xl p-6 space-y-4 hover:border-gym-accent transition-colors duration-200">
              <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">Smart Expiry Trackers</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Categorizes members automatically into Active, Expiring, and Expired categories based on calendar due dates.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#24262E] border border-gym-border rounded-2xl p-6 space-y-4 hover:border-gym-accent transition-colors duration-200">
              <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">One-Tap Reminders</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Open WhatsApp or SMS directly on your device with pre-filled, customized messages. No costly API subscriptions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#24262E] border border-gym-border rounded-2xl p-6 space-y-4 hover:border-gym-accent transition-colors duration-200">
              <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">Log Payments & Renew</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Audit cash, card, and UPI collections. Renewing automatically extends access from the future expiry date.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#24262E] border border-gym-border rounded-2xl p-6 space-y-4 hover:border-gym-accent transition-colors duration-200">
              <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">Installable Mobile App</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Use the Capacitor wrapper to run IronDesk on any Android or iOS device, syncing directly to the front desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-display font-bold text-white tracking-wide">
            SIMPLE 3-STEP <span className="text-gym-accent font-display">WORKFLOW</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Transition your gym operations in under 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative bg-[#1D1F25] border border-gym-border rounded-2xl p-8 space-y-3">
            <span className="text-5xl font-display font-bold text-gym-accent text-opacity-15 absolute top-4 right-6">01</span>
            <h3 className="text-xl font-display font-bold text-white">Create Plans & Staff</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Define membership pricing tiers (e.g. Monthly, Quarterly) and secure the console with a shared access PIN.
            </p>
            <div className="flex items-center space-x-2 text-gym-activeText text-xs font-semibold pt-2">
              <Check className="w-4 h-4" />
              <span>Completed in 1 minute</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative bg-[#1D1F25] border border-gym-border rounded-2xl p-8 space-y-3">
            <span className="text-5xl font-display font-bold text-gym-accent text-opacity-15 absolute top-4 right-6">02</span>
            <h3 className="text-xl font-display font-bold text-white">Add Your Members</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Register members with name, phone number, join date, and select their plan. Access due dates are calculated automatically.
            </p>
            <div className="flex items-center space-x-2 text-gym-activeText text-xs font-semibold pt-2">
              <Check className="w-4 h-4" />
              <span>Normalized phone formatting</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative bg-[#1D1F25] border border-gym-border rounded-2xl p-8 space-y-3">
            <span className="text-5xl font-display font-bold text-gym-accent text-opacity-15 absolute top-4 right-6">03</span>
            <h3 className="text-xl font-display font-bold text-white">Log Renewals</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Audit payment ledgers and send manual WhatsApp renewal texts with pre-filled message links directly on click.
            </p>
            <div className="flex items-center space-x-2 text-gym-activeText text-xs font-semibold pt-2">
              <Check className="w-4 h-4" />
              <span>Audit cash, UPI, & card</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Area */}
      <section className="bg-gym-panel border-t border-gym-border py-16 text-center px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-display font-bold text-white tracking-wide">
            Ready to secure your gym's dues?
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            Eliminate missed expirations and paper clutter. Start tracking collections with IronDesk today.
          </p>
          <div className="pt-4">
            <Link
              to="/app"
              className="inline-flex h-12 bg-gym-accent hover:bg-gym-accentHover text-black font-bold rounded-xl px-10 items-center justify-center space-x-2 transition-all duration-150 shadow-[0_4px_16px_rgba(242,169,59,0.3)] active:scale-95 text-sm"
            >
              <span>Launch Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-gym-border py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} IronDesk Systems. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-gray-400 cursor-pointer">Security Protocol</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 cursor-pointer">Operator Guide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
