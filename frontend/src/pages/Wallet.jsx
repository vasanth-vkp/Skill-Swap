import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Search,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import walletService from '../services/walletService';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { walletBalance, setWalletBalance } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'EARNED' | 'SPENT'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWalletData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [summaryData, txData] = await Promise.all([
        walletService.getWalletSummary(),
        walletService.getTransactionHistory(),
      ]);
      setSummary(summaryData);
      setTransactions(txData);

      // Keep AuthContext in sync with live backend balance
      if (summaryData?.balance !== undefined && setWalletBalance) {
        setWalletBalance(summaryData.balance);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setError('Unable to load wallet records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Tab filter
      if (activeTab === 'EARNED') {
        if (tx.direction !== 'EARNED' && tx.direction !== 'INITIAL_GRANT') return false;
      } else if (activeTab === 'SPENT') {
        if (tx.direction !== 'SPENT') return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchParty = tx.counterpartyName?.toLowerCase().includes(q);
      const matchSkill = tx.skillTitle?.toLowerCase().includes(q);
      const matchType = tx.type?.toLowerCase().includes(q);
      return matchParty || matchSkill || matchType;
    });
  }, [transactions, activeTab, searchQuery]);

  const earnedCount = useMemo(
    () => transactions.filter((t) => t.direction === 'EARNED' || t.direction === 'INITIAL_GRANT').length,
    [transactions]
  );
  const spentCount = useMemo(
    () => transactions.filter((t) => t.direction === 'SPENT').length,
    [transactions]
  );

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Verified Time Bank Ledger</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                Time-Credit Wallet
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                1 hour of service = 1 credit. Free of currency, backed by mutual community trust.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchWalletData(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                title="Refresh balance and transactions"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
                <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
              </button>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-coral-500 hover:from-amber-600 hover:to-coral-600 text-white text-sm font-bold shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Skills</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchWalletData()}
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hero Balance Card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-coral-600 p-7 text-white shadow-warm-lg flex flex-col justify-between min-h-[190px]">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-amber-100 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Balance</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-amber-100 text-sm font-semibold tracking-wide">
                <Clock className="w-4 h-4" />
                <span>AVAILABLE TIME CREDITS</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-display font-extrabold tracking-tight">
                  {loading
                    ? '...'
                    : Number(summary?.balance ?? walletBalance ?? 5.0).toFixed(1)}
                </span>
                <span className="text-2xl font-bold text-amber-100 font-display">Credits</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-50 font-medium">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Equivalent to {loading ? '5.0' : Number(summary?.balance ?? 5.0).toFixed(1)} hours of learning or services</span>
              </div>
              <span className="text-amber-100/90 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
                1 Credit = 1 Hour
              </span>
            </div>
          </div>

          {/* Total Earned Card */}
          <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Credits Earned
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-display font-bold text-emerald-950">
                {loading ? '...' : `+${Number(summary?.totalEarned ?? 0).toFixed(1)}`}
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Earned from teaching</span>
              </p>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="rounded-3xl bg-rose-50/80 border border-rose-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Credits Spent
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-display font-bold text-rose-950">
                {loading ? '...' : `-${Number(summary?.totalSpent ?? 0).toFixed(1)}`}
              </div>
              <p className="text-xs text-rose-700 mt-1 font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Spent on learning</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ledger & Transactions Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Card Header & Filter Bar */}
          <div className="p-6 border-b border-stone-100 bg-[#FAF8F5]/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-slate-900">
                  Transaction History & Audit Ledger
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                  {transactions.length}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Every credit transfer is atomically executed and cryptographically stored.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Tab Pills */}
              <div className="inline-flex p-1 rounded-2xl bg-stone-100 border border-stone-200">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'ALL'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  onClick={() => setActiveTab('EARNED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'EARNED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-emerald-700'
                  }`}
                >
                  Earned ({earnedCount})
                </button>
                <button
                  onClick={() => setActiveTab('SPENT')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'SPENT'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-rose-700'
                  }`}
                >
                  Spent ({spentCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by skill or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-1.5 rounded-xl border border-stone-200 bg-white text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full sm:w-56 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-stone-100">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-2xl bg-stone-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-200" />
                      <div className="space-y-2">
                        <div className="w-40 h-4 bg-stone-200 rounded" />
                        <div className="w-24 h-3 bg-stone-200 rounded" />
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-stone-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {transactions.length === 0
                    ? 'No transactions logged yet'
                    : 'No matching transactions found'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  {transactions.length === 0
                    ? 'Your transactions will appear here once you complete a skill exchange session with another member.'
                    : 'Try clearing your search query or switching tabs to view other records.'}
                </p>
                {transactions.length > 0 && searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Clear Search
                  </button>
                )}
                {transactions.length === 0 && (
                  <Link
                    to="/explore"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explore Available Skills</span>
                  </Link>
                )}
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isEarned = tx.direction === 'EARNED';
                const isSpent = tx.direction === 'SPENT';
                const isInitialGrant = tx.direction === 'INITIAL_GRANT';

                return (
                  <div
                    key={tx.id}
                    className="p-5 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Direction Icon Badge */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          isEarned
                            ? 'bg-emerald-100 text-emerald-700'
                            : isSpent
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isEarned ? (
                          <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                        ) : isSpent ? (
                          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <Sparkles className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </div>

                      {/* Transaction Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            {tx.skillTitle || 'Service Exchange'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              isEarned
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isSpent
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isInitialGrant ? 'Welcome Grant' : isEarned ? 'Service Provided' : 'Service Received'}
                          </span>
                        </div>

                        <div className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>
                            {isInitialGrant
                              ? 'From SkillSwap Platform'
                              : isEarned
                              ? `Provided to ${tx.counterpartyName}`
                              : `Delivered by ${tx.counterpartyName}`}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-stone-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(tx.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Pill */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
                      <span
                        className={`font-display font-extrabold text-base ${
                          isEarned || isInitialGrant ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isEarned || isInitialGrant ? '+' : '-'}
                        {Number(tx.amount).toFixed(1)} Credits
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {Number(tx.amount).toFixed(1)} hrs of service
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
