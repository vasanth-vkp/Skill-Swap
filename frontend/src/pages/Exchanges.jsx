import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Send,
  Filter,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import exchangeService from '../services/exchangeService';
import ExchangeCard from '../components/exchange/ExchangeCard';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Declined' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export default function Exchanges() {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExchanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (activeTab === 'incoming') {
        data = await exchangeService.getIncomingExchanges(statusFilter);
      } else {
        data = await exchangeService.getOutgoingExchanges(statusFilter);
      }

      setExchanges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load exchanges:', err);
      setError('Unable to load exchange requests at this time.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const handleAccept = async (id) => {
    try {
      await exchangeService.acceptExchange(id);
      fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept exchange request.');
    }
  };

  const handleReject = async (id) => {
    try {
      await exchangeService.rejectExchange(id);
      fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to decline exchange request.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await exchangeService.cancelExchange(id);
      fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel exchange request.');
    }
  };

  const pendingCount = exchanges.filter((e) => e.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Skill Exchanges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display tracking-tight">
              Manage Exchange Requests
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Coordinate and track incoming requests from learners and outgoing requests to community mentors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
            >
              <span>Explore More Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Tab Selector & Status Filters */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            {/* Primary Segmented Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('incoming');
                  setStatusFilter('ALL');
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'incoming'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Inbox className="w-4 h-4 text-amber-600" />
                <span>Incoming Requests</span>
                {activeTab === 'incoming' && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('outgoing');
                  setStatusFilter('ALL');
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'outgoing'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Send className="w-4 h-4 text-amber-600" />
                <span>Outgoing Requests</span>
                {activeTab === 'outgoing' && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchExchanges}
              title="Refresh requests"
              className="self-end sm:self-auto p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div data-testid="exchanges-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm animate-pulse flex flex-col justify-between h-72"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 bg-stone-200 rounded-full" />
                    <div className="h-4 w-16 bg-stone-200 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-stone-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-stone-200 rounded" />
                      <div className="h-3 w-1/2 bg-stone-200 rounded" />
                    </div>
                  </div>
                  <div className="h-14 bg-stone-100 rounded-2xl" />
                </div>
                <div className="h-10 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : exchanges.length > 0 ? (
          <div data-testid="exchanges-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exchanges.map((exchange) => (
              <ExchangeCard
                key={exchange.id}
                exchange={exchange}
                isIncoming={activeTab === 'incoming'}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <div
            data-testid="exchanges-empty"
            className="bg-white rounded-3xl p-10 border border-dashed border-stone-300 text-center max-w-lg mx-auto shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              {activeTab === 'incoming' ? <Inbox className="w-7 h-7" /> : <Send className="w-7 h-7" />}
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-1">
              {activeTab === 'incoming'
                ? 'No incoming requests found'
                : 'No outgoing requests found'}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              {activeTab === 'incoming'
                ? 'When community members send requests to learn skills you teach, they will appear here for you to accept or decline.'
                : 'Explore community skills and send requests to members to learn programming, languages, trades, or arts.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {activeTab === 'incoming' ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  <span>Add Skills to Teach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  <span>Explore Skills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
