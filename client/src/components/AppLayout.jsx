import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Clock, AlertTriangle, Settings, LogOut } from 'lucide-react';

export default function AppLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Members', path: '/app/members', icon: Users },
    { label: 'Reminders', path: '/app/reminders', icon: Clock },
    { label: 'Dues', path: '/app/dues', icon: AlertTriangle },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gym-bg text-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-gym-panel border-r border-gym-border p-5 flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-display font-bold tracking-wider text-white">
              IRON<span className="text-gym-accent">DESK</span>
            </h2>
            <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase">Front Desk Console</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gym-accent text-black font-semibold shadow-[0_4px_12px_rgba(242,169,59,0.15)]'
                      : 'text-gray-400 hover:text-white hover:bg-[#24262E]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & logout */}
        <div className="border-t border-[#33353E] pt-4 px-2 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Operator</p>
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="w-8 h-8 rounded-lg bg-[#24262E] hover:bg-red-500 hover:bg-opacity-20 hover:text-gym-expiredText text-gray-400 flex items-center justify-center transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Mobile Only */}
        <header className="md:hidden flex items-center justify-between h-16 bg-gym-panel border-b border-gym-border px-5 flex-shrink-0">
          <h2 className="text-xl font-display font-bold tracking-wider text-white">
            IRON<span className="text-gym-accent">DESK</span>
          </h2>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gym-expiredText transition-colors duration-150"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content Container */}
        <div className="flex-grow p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </div>

        {/* Navigation Bar - Mobile Bottom */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gym-panel border-t border-gym-border flex items-center justify-around z-40 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-grow py-1 space-y-1 transition-colors duration-150 ${
                  isActive ? 'text-gym-accent' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
