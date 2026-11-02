import React, { useState } from 'react';
import { formatINR } from '../services/api';
import { 
  ShieldAlert, 
  Activity, 
  Target, 
  ArrowDownRight, 
  Info, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function RiskAnalysis({ riskData }) {
  const [activeTab, setActiveTab] = useState('sharpe');

  if (!riskData) return null;

  const {
    annualized_volatility = 0,
    sharpe_ratio = 0,
    beta = 1.0,
    max_drawdown = 0,
    var_95_daily = 0,
    risk_level = "Moderate",
    metrics_interpretation = {}
  } = riskData;

  const riskBadgeStyles = {
    "Conservative / Low": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Moderate": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Growth / High": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Aggressive / Very High": "bg-red-500/10 text-red-400 border-red-500/20"
  }[risk_level] || "bg-blue-500/10 text-blue-400 border-blue-500/20";

  const metricsConfig = [
    {
      id: 'sharpe',
      name: 'Sharpe Ratio',
      value: `${sharpe_ratio.toFixed(2)}`,
      sub: 'vs 6.8% Indian G-Sec Rf',
      icon: Target,
      color: 'emerald',
      meaning: metrics_interpretation.sharpe || 'Risk-adjusted excess return per unit of volatility above Indian 10-Yr sovereign yield.'
    },
    {
      id: 'volatility',
      name: 'Annualized Volatility (σ)',
      value: `${(annualized_volatility * 100).toFixed(1)}%`,
      sub: '252-day scaled dispersion',
      icon: Activity,
      color: 'blue',
      meaning: metrics_interpretation.volatility || 'Standard deviation of annual returns measuring overall portfolio price fluctuation.'
    },
    {
      id: 'beta',
      name: 'Beta vs Nifty 50 (β)',
      value: `${beta.toFixed(2)}`,
      sub: 'Nifty 50 (^NSEI) benchmark',
      icon: Sparkles,
      color: 'purple',
      meaning: metrics_interpretation.beta || 'Systematic sensitivity to broad Indian stock market movements. Beta > 1 moves more than Nifty.'
    },
    {
      id: 'var',
      name: '1-Day VaR (95%)',
      value: formatINR(var_95_daily),
      sub: 'Max daily expected loss',
      icon: ShieldAlert,
      color: 'amber',
      meaning: metrics_interpretation.var_95 || 'Parametric value at risk representing 95% confident single-day downside limit in normal markets.'
    },
    {
      id: 'mdd',
      name: 'Max Drawdown (MDD)',
      value: `${(max_drawdown * 100).toFixed(1)}%`,
      sub: 'Peak-to-trough drop',
      icon: ArrowDownRight,
      color: 'red',
      meaning: metrics_interpretation.drawdown || 'Worst observed historical percentage drop from portfolio peak prior to recovery.'
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Institutional Risk & Volatility Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional portfolio risk analytics calibrated to the Indian financial ecosystem
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Portfolio Risk Profile:</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${riskBadgeStyles}`}>
            {risk_level}
          </span>
        </div>
      </div>

      {/* Grid of 5 key financial metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        {metricsConfig.map((m) => {
          const Icon = m.icon;
          const isSelected = activeTab === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium truncate">{m.name}</span>
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <div className="text-xl font-extrabold text-white tracking-tight font-mono">
                {m.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            {metricsConfig.find(m => m.id === activeTab)?.name} Rationale:
          </div>
          <p className="text-slate-400 leading-relaxed">
            {metricsConfig.find(m => m.id === activeTab)?.meaning}
          </p>
        </div>
      </div>
    </div>
  );
}
