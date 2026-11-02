import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Layers
} from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role: 'investor' });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail, demoPass) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err) {
      setErrorMsg('Demo sign-in failed. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
          FinFolio India
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Indian Stocks, Mutual Funds, CSV Statements & Risk Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 border border-slate-800 shadow-2xl rounded-3xl">
          
          {/* Quick Demo Sign-in Banner */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('investor@example.com', 'investor123')}
                className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Demo Investor</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin@example.com', 'admin123')}
                className="py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-slate-900 text-slate-500">Or continue with email</span></div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New investor?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Create an account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
          <div className="flex flex-col items-center">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 mb-1" />
            <span>CSV Import</span>
          </div>
          <div className="flex flex-col items-center">
            <Activity className="w-4 h-4 text-emerald-400 mb-1" />
            <span>Live Yahoo Tickers</span>
          </div>
          <div className="flex flex-col items-center">
            <Layers className="w-4 h-4 text-emerald-400 mb-1" />
            <span>Nifty 50 Risk Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
