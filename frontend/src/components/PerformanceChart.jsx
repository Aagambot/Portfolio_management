import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatINR } from '../services/api';
import { TrendingUp, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-400 mb-2">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between space-x-4 text-xs py-0.5">
            <span className="flex items-center space-x-1.5 font-medium" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span>{item.name}:</span>
            </span>
            <span className="font-bold text-white font-mono">
              {formatINR(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ data = [] }) {
  const [timeframe, setTimeframe] = useState('ALL');

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeframe === '30D') return data.slice(-30);
    if (timeframe === '60D') return data.slice(-60);
    return data;
  }, [data, timeframe]);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Portfolio Growth vs Nifty 50</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical value trajectory relative to initial invested capital and Nifty benchmark
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 self-start sm:self-auto">
          {['30D', '60D', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                timeframe === tf
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full mt-4">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.slice(5)} // MM-DD
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={30} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />

              <Area
                type="monotone"
                dataKey="portfolio_value"
                name="Your Portfolio (₹)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#portfolioGrad)"
              />
              <Area
                type="monotone"
                dataKey="benchmark_normalized"
                name="Nifty 50 Benchmark"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#niftyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Calendar className="w-8 h-8 text-slate-600 mb-2" />
            <span>Record trades or import a CSV statement to render performance charts</span>
          </div>
        )}
      </div>
    </div>
  );
}
