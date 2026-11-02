import React, { useState } from 'react';
import { portfolioService } from '../services/api';
import { Wallet, X, Loader2, AlertCircle } from 'lucide-react';

export default function NewPortfolioModal({ isOpen, onClose, onPortfolioCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      await portfolioService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        currency: 'INR'
      });
      setName('');
      setDescription('');
      onPortfolioCreated();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create portfolio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Create New Portfolio</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Portfolio Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. My Zerodha Long Term"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Core Indian equities, mutual fund SIPs & Gold ETFs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            Base currency: <strong className="text-emerald-400">INR (₹)</strong> | Benchmark: <strong className="text-blue-400">Nifty 50 (^NSEI)</strong>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Portfolio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

