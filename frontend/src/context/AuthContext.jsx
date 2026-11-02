import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, portfolioService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [portfolios, setPortfolios] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          await loadPortfolios();
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loadPortfolios = async () => {
    try {
      const list = await portfolioService.list();
      setPortfolios(list);
      if (list.length > 0) {
        // Preserve selected or default to first
        setActivePortfolio((prev) => {
          if (prev) {
            const found = list.find((p) => p.id === prev.id);
            return found || list[0];
          }
          return list[0];
        });
      }
    } catch (err) {
      console.error('Failed to load portfolios', err);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    await loadPortfolios();
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    await loadPortfolios();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setPortfolios([]);
    setActivePortfolio(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        portfolios,
        activePortfolio,
        setActivePortfolio,
        login,
        register,
        logout,
        refreshPortfolios: loadPortfolios,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

