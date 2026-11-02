import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function MetricCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon: Icon, 
  tooltip, 
  subtitle,
  badgeText,
  badgeColor = "emerald"
}) {
  return (
    <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-200 group shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center space-x-1.5">
          <span>{title}</span>
          {tooltip && (
            <span className="group/tip relative cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tip:block w-48 p-2 bg-slate-800 text-slate-200 text-[11px] rounded-lg shadow-xl border border-slate-700 z-30">
                {tooltip}
              </div>
            </span>
          )}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        {change !== undefined && change !== null && (
          <span className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {change}
          </span>
        )}

        {badgeText && (
          <span className="text-[11px] font-medium text-slate-400">
            {badgeText}
          </span>
        )}

        {subtitle && (
          <span className="text-slate-400 text-xs">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
