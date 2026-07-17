import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('irondesk_token'));
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  // Check setup status on load
  const checkSetupStatus = async () => {
    try {
      const res = await fetch('/api/auth/check-setup');
      if (res.ok) {
        const data = await res.json();
        setSetupRequired(data.setupRequired);
      }
    } catch (err) {
      console.error('Failed to check setup status:', err);
    }
  };

  // Validate token and load user profile
  const loadUser = async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired/invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to authenticate token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkSetupStatus();
      if (token) {
        await loadUser(token);
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = async (pin) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('irondesk_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSetupRequired(false);
    return data.user;
  };

  const setup = async (name, pin) => {
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Setup failed');
    }

    localStorage.setItem('irondesk_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSetupRequired(false);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('irondesk_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      setupRequired,
      login,
      setup,
      logout,
      checkSetupStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
