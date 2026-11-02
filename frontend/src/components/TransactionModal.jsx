import React, { useState } from 'react';
import { transactionService, formatINR } from '../services/api';
import { PlusCircle, X, Loader2, AlertCircle } from 'lucide-react';

const POPULAR_INDIAN_ASSETS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', type: 'STOCK' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', type: 'STOCK' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', type: 'STOCK' },
  { symbol: 'INFY.NS', name: 'Infosys', type: 'STOCK' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', type: 'STOCK' },
  { symbol: 'PARAG_PARIKH_FLEXI_CAP', name: 'Parag Parikh Flexi Cap Fund', type: 'MUTUAL_FUND' },
  { symbol: 'UTI_NIFTY_50_INDEX', name: 'UTI Nifty 50 Index Fund', type: 'MUTUAL_FUND' },
  { symbol: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty 50 BeES', type: 'ETF' },
  { symbol: 'GOLDBEES.NS', name: 'Nippon India ETF Gold BeES', type: 'ETF' }
];

export default function TransactionModal({ isOpen, onClose, portfolioId, onTransactionSuccess }) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('STOCK');
  const [txType, setTxType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [fees, setFees] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSelectQuickAsset = (asset) => {
    setSymbol(asset.symbol);
    setName(asset.name);
    setAssetType(asset.type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await transactionService.create(portfolioId, {
        symbol: symbol.trim().toUpperCase(),
        name: name.trim() || symbol.trim(),
        asset_type: assetType,
        transaction_type: txType,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        fees: parseFloat(fees || 0),
        notes: notes.trim() || undefined,
      });

      onTransactionSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit trade.');
    } finally {
      setLoading(false);
    }
  };

  const estTotal = (parseFloat(quantity || 0) * parseFloat(price || 0)) + parseFloat(fees || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Record Trade / Investment</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Select Popular Indian Assets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Quick Select Popular Indian Assets:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_INDIAN_ASSETS.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectQuickAsset(item)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-mono ${
                    symbol === item.symbol
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}
                >
                  {item.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Type (BUY vs SELL) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTxType('BUY')}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                txType === 'BUY'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              BUY / SIP
            </button>
            <button
              type="button"
              onClick={() => setTxType('SELL')}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                txType === 'SELL'
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              SELL / REDEEM
            </button>
          </div>

          {/* Asset Type */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'STOCK', label: 'Direct Stock' },
              { id: 'MUTUAL_FUND', label: 'Mutual Fund' },
              { id: 'ETF', label: 'ETF' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setAssetType(t.id)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                  assetType === t.id
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Symbol & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Ticker / Symbol *</label>
              <input
                type="text"
                required
                placeholder="e.g. INFY.NS or MF Scheme"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Company / Fund Name</label>
              <input
                type="text"
                placeholder="e.g. Infosys Limited"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                {assetType === 'MUTUAL_FUND' ? 'Units (Decimals OK) *' : 'Shares / Qty *'}
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                placeholder="e.g. 15 or 142.385"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Price / NAV (₹) *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="e.g. 1820.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Fees / STT (₹)</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Estimated Amount */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Trade Value:</span>
            <span className="font-extrabold text-white font-mono text-sm">{formatINR(estTotal)}</span>
          </div>

          {/* Footer Actions */}
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
              disabled={loading || !symbol || !quantity || !price}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Execute {txType}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

