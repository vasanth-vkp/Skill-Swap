import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import bookingService from '../../services/bookingService';

export default function ScheduleBookingModal({
  isOpen,
  onClose,
  exchange,
  existingBooking = null,
  onSuccess,
}) {
  const isReschedule = Boolean(existingBooking && existingBooking.id);
  const duration = Number(exchange?.duration || existingBooking?.duration || 1.0);

  // Form state
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to format Date to input datetime-local value (YYYY-MM-DDTHH:mm)
  const formatForInput = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const minDateTime = useMemo(() => {
    // 15 minutes from now
    const min = new Date(Date.now() + 15 * 60 * 1000);
    return formatForInput(min);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (existingBooking?.startTime) {
        setSelectedDateTime(formatForInput(new Date(existingBooking.startTime)));
      } else {
        // Default to tomorrow at 10:00 AM local time or minDateTime + 2 hours
        const defaultDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
        setSelectedDateTime(formatForInput(defaultDate));
      }
    }
  }, [isOpen, existingBooking]);

  if (!isOpen || !exchange) return null;

  // Calculate estimated end time
  let estimatedEnd = null;
  if (selectedDateTime) {
    const startObj = new Date(selectedDateTime);
    if (!isNaN(startObj.getTime())) {
      estimatedEnd = new Date(startObj.getTime() + duration * 60 * 60 * 1000);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateTime) {
      setError('Please select a date and start time.');
      return;
    }

    const startDate = new Date(selectedDateTime);
    if (isNaN(startDate.getTime())) {
      setError('Please enter a valid date and time.');
      return;
    }

    const minDateObj = new Date(Date.now() + 14 * 60 * 1000);
    if (startDate < minDateObj) {
      setError('Start time must be at least 15 minutes in the future.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const isoStart = startDate.toISOString();
      let result;

      if (isReschedule) {
        result = await bookingService.rescheduleBooking(existingBooking.id, {
          startTime: isoStart,
        });
      } else {
        result = await bookingService.scheduleBooking(exchange.id, {
          startTime: isoStart,
        });
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      console.error('Failed to schedule session:', err);
      const message =
        err.response?.data?.error ||
        err.message ||
        'Unable to schedule session. Please try a different time slot.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-b border-stone-100 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isReschedule ? 'Reschedule Session' : 'Schedule Session'}</span>
            </div>
            <h2 id="schedule-modal-title" className="text-xl font-bold text-stone-900 font-display">
              {isReschedule ? 'Pick a New Date & Time' : 'Coordinate Your Exchange Date'}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {exchange.skillName} with {exchange.providerName || exchange.requesterName || 'Partner'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Session Overview Card */}
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider text-stone-400">Skill Service</span>
              <span className="font-bold text-stone-900">{exchange.skillName}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider text-stone-400">Session Duration</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{duration.toFixed(1)} Hours ({duration.toFixed(1)} Credits)</span>
              </span>
            </div>
          </div>

          {/* Date & Start Time Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="session-datetime"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600"
            >
              Start Date & Time (Local)
            </label>
            <div className="relative">
              <input
                id="session-datetime"
                type="datetime-local"
                min={minDateTime}
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm text-stone-800 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Times are in your local device timezone. Both participants receive confirmation.
            </p>
          </div>

          {/* Calculated End Time Indicator */}
          {estimatedEnd && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Calculated End Time:</span>
              </div>
              <span className="font-bold text-emerald-950">
                {estimatedEnd.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                ({estimatedEnd.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })})
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDateTime}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{isReschedule ? 'Update Schedule' : 'Confirm Schedule'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
