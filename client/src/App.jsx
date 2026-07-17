import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import AppLayout from './components/AppLayout';

import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Reminders from './pages/Reminders';
import Dues from './pages/Dues';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading, setupRequired } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gym-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Syncing Database...</p>
      </div>
    );
  }

  if (!user || !token) {
    if (setupRequired) {
      return <SetupPage />;
    }
    return <LoginPage />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Private Operations Console */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Sub-views inside operations console */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="dues" element={<Dues />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
