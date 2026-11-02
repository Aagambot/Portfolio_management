import React, { useState } from 'react';
import { formatINR, formatPercent } from '../services/api';
import { Search, Layers, ArrowUpDown, ExternalLink } from 'lucide-react';

export default function HoldingsTable({ holdings = [], onAddTrade }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [sortField, setSortField] = useState('current_value');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredHoldings = React.useMemo(() => {
    return holdings
      .filter((h) => {
        const matchesSearch = 
          h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        if (selectedFilter === 'ALL') return true;
        if (selectedFilter === 'STOCK') return h.asset_type === 'STOCK';
        if (selectedFilter === 'MUTUAL_FUND') return h.asset_type === 'MUTUAL_FUND';
        if (selectedFilter === 'ETF') return h.asset_type === 'ETF';
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [holdings, searchTerm, selectedFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getAssetBadge = (type) => {
    switch (type) {
      case 'MUTUAL_FUND':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Mutual Fund</span>;
      case 'ETF':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">ETF</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Stock</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Active Holdings</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 ml-2">
              {holdings.length} Positions
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of Indian stocks, mutual fund units, and weighted cost basis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker or fund..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/90 border border-slate-700/80 text-xs rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'STOCK', label: 'Stocks' },
              { id: 'MUTUAL_FUND', label: 'Mutual Funds' },
              { id: 'ETF', label: 'ETFs' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  selectedFilter === f.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px] font-semibold tracking-wider uppercase">
            <tr>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('symbol')}>
                <div className="flex items-center space-x-1">
                  <span>Asset</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('quantity')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Units / Shares</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Avg Cost</th>
              <th className="py-3 px-3 text-right">Current Price/NAV</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('current_value')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Market Value</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('unrealized_pnl')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Unrealized P&L</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('allocation_percent')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Weight</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredHoldings.length > 0 ? (
              filteredHoldings.map((h, idx) => {
                const isProfitable = h.unrealized_pnl >= 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {/* Asset Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white font-mono tracking-tight">{h.symbol}</span>
                          {getAssetBadge(h.asset_type)}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {h.name}
                        </span>
                      </div>
                    </td>

                    {/* Quantity (with decimals for MFs) */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                      {h.quantity.toLocaleString('en-IN', { maximumFractionDigits: 4 })}
                    </td>

                    {/* Avg Cost */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                      {formatINR(h.avg_buy_price)}
                    </td>

                    {/* Current Price */}
                    <td className="py-3.5 px-3 text-right font-mono text-white">
                      {formatINR(h.current_price)}
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatINR(h.current_value)}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isProfitable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {formatINR(h.unrealized_pnl)} ({formatPercent(h.unrealized_pnl_percent)})
                      </span>
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      <div className="flex items-center justify-end space-x-2">
                        <span>{h.allocation_percent}%</span>
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(h.allocation_percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No active holdings found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
