import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/api';
import { 
  TrendingUp, 
  Wallet, 
  User, 
  LogOut, 
  Plus, 
  Upload, 
  PlusCircle, 
  ShieldCheck, 
  BarChart2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenCsvModal, onOpenTxModal, onOpenNewPortfolioModal }) {
  const { user, role, portfolios, activePortfolio, setActivePortfolio, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleQuickLogin = async (email, pass) => {
    try {
      await login(email, pass);
    } catch (err) {
      alert('Login failed. Please check backend connection.');
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">FinFolio</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Indian Market (₹)
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Stocks, Mutual Funds & Risk Analytics</p>
            </div>
          </div>

          {/* Portfolio Selector & Actions */}
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Active Portfolio Switcher */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 transition"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="max-w-[140px] sm:max-w-[180px] truncate">
                    {activePortfolio ? activePortfolio.name : 'Select Portfolio'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                    <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Your Portfolios
                    </div>
                    {portfolios.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePortfolio(p);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-800/80 transition ${
                          activePortfolio?.id === p.id ? 'text-emerald-400 font-semibold bg-emerald-500/10' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="text-xs text-slate-500">₹{p.total_value?.toLocaleString('en-IN') || '0'}</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenNewPortfolioModal();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center space-x-2 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Portfolio</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button
                onClick={onOpenCsvModal}
                className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium transition shadow-sm"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={onOpenTxModal}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-sm font-semibold transition shadow-lg shadow-emerald-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Trade</span>
              </button>

              {/* User Role Badge & Logout */}
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  role === 'admin' 
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {role === 'admin' ? 'Admin' : 'Investor'}
                </span>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Quick Demo Login Bar */
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 hidden md:inline">Quick Demo Sign-in:</span>
              <button
                onClick={() => handleQuickLogin('investor@example.com', 'investor123')}
                className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Demo Investor</span>
              </button>
              <button
                onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
                className="flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demo Admin</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
