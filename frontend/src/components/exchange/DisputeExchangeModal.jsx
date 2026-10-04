import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import exchangeService from '../../services/exchangeService';

const DISPUTE_REASONS = [
  'No-show / Partner did not attend',
  'Session cut significantly short',
  'Topic delivered did not match agreed skill',
  'Technical or audio/video failure prevented exchange',
  'Other reason',
];

export default function DisputeExchangeModal({
  isOpen,
  onClose,
  exchange,
  onSuccess,
}) {
  const [selectedReason, setSelectedReason] = useState(DISPUTE_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !exchange) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const fullReason = details.trim()
      ? `${selectedReason}: ${details.trim()}`
      : selectedReason;

    try {
      setLoading(true);
      await exchangeService.disputeExchange(exchange.id, { reason: fullReason });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit dispute:', err);
      setError(err.response?.data?.error || 'Failed to submit dispute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="dispute-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-display">
                Report Issue / File Dispute
              </h2>
              <p className="text-xs text-stone-500">
                Flag an issue with this skill exchange session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700">Skill:</span>
              <span className="font-bold text-stone-900">{exchange.skillName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700">Partner:</span>
              <span className="font-medium text-stone-800">
                {exchange.providerName || exchange.requesterName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700">Duration:</span>
              <span className="font-medium text-stone-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {Number(exchange.duration || 1.0).toFixed(1)} Hours
              </span>
            </div>
          </div>

          {/* Warning notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Filing a dispute pauses automatic credit settlement and flags this exchange for community resolution.
            </p>
          </div>

          {error && (
            <div
              data-testid="dispute-error"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
            >
              {error}
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Primary Reason
            </label>
            <div className="space-y-2">
              {DISPUTE_REASONS.map((reason) => (
                <label
                  key={reason}
                  data-testid="dispute-reason-option"
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                    selectedReason === reason
                      ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-semibold shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="disputeReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-stone-300"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-1.5">
            <label
              htmlFor="dispute-details"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Additional Details (Optional)
            </label>
            <textarea
              id="dispute-details"
              data-testid="dispute-notes-input"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what occurred during the exchange..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-dispute-btn"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Dispute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
