import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { holdingsService, formatINR, formatPercent } from '../services/api';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import PerformanceChart from '../components/PerformanceChart';
import AllocationChart from '../components/AllocationChart';
import HoldingsTable from '../components/HoldingsTable';
import RiskAnalysis from '../components/RiskAnalysis';
import CsvImportModal from '../components/CsvImportModal';
import TransactionModal from '../components/TransactionModal';
import NewPortfolioModal from '../components/NewPortfolioModal';

import { 
  IndianRupee, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  Target, 
  Briefcase, 
  UploadCloud, 
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { activePortfolio, refreshPortfolios } = useAuth();
  
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isNewPortModalOpen, setIsNewPortModalOpen] = useState(false);

  const fetchPortfolioData = async (isManualRefresh = false) => {
    if (!activePortfolio) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [sumRes, holdRes, allocRes, perfRes, riskRes] = await Promise.all([
        holdingsService.getSummary(activePortfolio.id),
        holdingsService.getHoldings(activePortfolio.id),
        holdingsService.getAllocations(activePortfolio.id),
        holdingsService.getPerformance(activePortfolio.id),
        holdingsService.getRiskMetrics(activePortfolio.id),
      ]);

      setSummary(sumRes);
      setHoldings(holdRes);
      setAllocations(allocRes);
      setPerformance(perfRes);
      setRiskMetrics(riskRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [activePortfolio]);

  const handleDataChanged = async () => {
    await fetchPortfolioData();
    await refreshPortfolios();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navigation */}
      <Navbar
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onOpenTxModal={() => setIsTxModalOpen(true)}
        onOpenNewPortfolioModal={() => setIsNewPortModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header Bar with Portfolio Details and Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activePortfolio ? activePortfolio.name : 'Your Portfolio'}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                INR (₹) Base
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {activePortfolio?.description || 'Active holdings in Indian equities and mutual fund schemes'}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={() => fetchPortfolioData(true)}
              disabled={refreshing}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh Quotes</span>
            </button>

            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import Statement</span>
            </button>
          </div>
        </div>

        {/* 4 Core Financial Metrics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Portfolio Value"
            value={formatINR(summary?.total_value || 0)}
            change={formatPercent(summary?.total_roi_percent || 0)}
            isPositive={(summary?.total_roi_percent || 0) >= 0}
            icon={IndianRupee}
            tooltip="Current liquidated value of all open Indian stock, mutual fund, and ETF positions."
            badgeText="Live Quotes"
          />

          <MetricCard
            title="Total Invested Capital"
            value={formatINR(summary?.total_invested || 0)}
            subtitle={`${summary?.holdings_count || 0} Open Positions`}
            icon={Briefcase}
            tooltip="Net deployed capital calculated across all buy tranches and SIP investments."
          />

          <MetricCard
            title="Unrealized P&L"
            value={formatINR(summary?.unrealized_pnl || 0)}
            change={formatPercent(summary?.total_roi_percent || 0)}
            isPositive={(summary?.unrealized_pnl || 0) >= 0}
            icon={TrendingUp}
            tooltip="Floating paper gains or losses on actively held stock and mutual fund units."
            badgeText="Open Gains"
          />

          <MetricCard
            title="Realized Gains (Sold)"
            value={formatINR(summary?.realized_pnl || 0)}
            isPositive={(summary?.realized_pnl || 0) >= 0}
            icon={CheckCircle}
            tooltip="Locked-in cash profit or loss realized upon executing SELL transactions."
            badgeText="Booked Cash"
          />
        </div>

        {/* Interactive Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart data={performance} />
          </div>
          <div>
            <AllocationChart 
              allocations={allocations} 
              totalValue={summary?.total_value || 0} 
            />
          </div>
        </div>

        {/* Institutional Risk & Volatility Analysis */}
        <RiskAnalysis riskData={riskMetrics} />

        {/* Active Holdings Table */}
        <HoldingsTable 
          holdings={holdings} 
          onAddTrade={() => setIsTxModalOpen(true)} 
        />

      </main>

      {/* CSV Import Modal */}
      {activePortfolio && (
        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          portfolioId={activePortfolio.id}
          onImportSuccess={handleDataChanged}
        />
      )}

      {/* Add Transaction Modal */}
      {activePortfolio && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          portfolioId={activePortfolio.id}
          onTransactionSuccess={handleDataChanged}
        />
      )}

      {/* New Portfolio Modal */}
      <NewPortfolioModal
        isOpen={isNewPortModalOpen}
        onClose={() => setIsNewPortModalOpen(false)}
        onPortfolioCreated={handleDataChanged}
      />
    </div>
  );
}

