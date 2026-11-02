import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../services/api';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export default function AllocationChart({ allocations = [], totalValue = 0 }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-emerald-400" />
            <span>Asset Allocation</span>
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {allocations.length} Categories
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Diversification across direct Indian Equities, Mutual Funds, and ETFs
        </p>
      </div>

      <div className="my-3 h-48 w-full flex items-center justify-center">
        {allocations.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocations}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {allocations.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#0f172a" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val, name, item) => [formatINR(val), item.payload.name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-xs text-slate-500">No asset data available</div>
        )}
      </div>

      {/* Breakdown Legend */}
      <div className="space-y-2 mt-2">
        {allocations.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center space-x-2">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              ></span>
              <span className="font-medium text-slate-300">{item.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-white font-mono">{item.percent}%</span>
              <span className="text-slate-400 text-[11px] font-mono">{formatINR(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

