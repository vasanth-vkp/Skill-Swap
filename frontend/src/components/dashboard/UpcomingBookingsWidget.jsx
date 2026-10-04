import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CalendarCheck2,
  Edit2,
  Trash2,
  MapPin,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import ScheduleBookingModal from '../booking/ScheduleBookingModal';

export default function UpcomingBookingsWidget() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getUpcomingBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load upcoming bookings:', err);
      setError('Unable to load upcoming sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled session? The exchange will remain accepted and you can reschedule anytime.')) {
      return;
    }
    try {
      setActionLoadingId(bookingId);
      await bookingService.cancelBooking(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel session.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getRelativeTimeBadge = (startIso) => {
    const now = new Date();
    const start = new Date(startIso);
    const diffMs = start - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 0) return 'Session in progress';
    if (diffMins < 60) return `Starts in ${diffMins}m`;

    const isToday =
      now.getDate() === start.getDate() &&
      now.getMonth() === start.getMonth() &&
      now.getFullYear() === start.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      tomorrow.getDate() === start.getDate() &&
      tomorrow.getMonth() === start.getMonth() &&
      tomorrow.getFullYear() === start.getFullYear();

    const timeString = start.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });

    if (isToday) return `Today at ${timeString}`;
    if (isTomorrow) return `Tomorrow at ${timeString}`;
    if (diffDays <= 7) return `In ${diffDays} days (${timeString})`;

    return start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }) + ` at ${timeString}`;
  };

  return (
    <section className="mb-8" data-testid="upcoming-bookings-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-semibold mb-1">
            <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scheduled Sessions</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-display">
            Your Upcoming Skill Swaps
          </h2>
          <p className="text-xs text-stone-500">
            Track confirmed dates, coordinate with learning partners, and join upcoming sessions.
          </p>
        </div>
        <Link
          to="/exchanges"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
        >
          <span>Manage All Exchanges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content Area */}
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div data-testid="upcoming-bookings-loading" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs animate-pulse flex flex-col justify-between h-44"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 bg-stone-200 rounded-full" />
                  <div className="h-4 w-16 bg-stone-200 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-1/2 bg-stone-200 rounded" />
                    <div className="h-3 w-1/3 bg-stone-200 rounded" />
                  </div>
                </div>
              </div>
              <div className="h-8 bg-stone-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div data-testid="upcoming-bookings-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            const countdownText = getRelativeTimeBadge(booking.startTime);
            const durationNum = Number(booking.duration || 1.0).toFixed(1);

            return (
              <div
                key={booking.id}
                data-testid={`booking-card-${booking.id}`}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Relative countdown and Duration */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{countdownText}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-stone-400">
                      {durationNum} Hours ({durationNum} Credits)
                    </span>
                  </div>

                  {/* Partner & Skill Row */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 overflow-hidden flex-shrink-0">
                      <img
                        src={
                          booking.providerAvatar ||
                          booking.requesterAvatar ||
                          `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(
                            booking.providerName || booking.requesterName || 'Member'
                          )}&backgroundColor=fef3c7`
                        }
                        alt="Partner"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-stone-900 line-clamp-1">
                        {booking.skillName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                        <span>with</span>
                        <Link
                          to={`/members/${booking.providerId || booking.requesterId}`}
                          className="font-semibold text-stone-800 hover:text-amber-600 transition-colors"
                        >
                          {booking.providerName || booking.requesterName}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Time Window Details */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-600 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {startDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-800">
                      {startDate.toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}{' '}
                      –{' '}
                      {endDate.toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setReschedulingBooking(booking)}
                    disabled={actionLoadingId === booking.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={actionLoadingId === booking.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          data-testid="upcoming-bookings-empty"
          className="bg-white rounded-3xl p-6 border border-dashed border-stone-300 text-center shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 mb-1">
            No upcoming sessions scheduled yet
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
            Once you and your learning partners schedule dates for accepted exchange requests, they will appear here with live countdowns.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/exchanges"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
            >
              <span>View Exchanges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <ScheduleBookingModal
          isOpen={Boolean(reschedulingBooking)}
          onClose={() => setReschedulingBooking(null)}
          exchange={{
            id: reschedulingBooking.requestId,
            skillName: reschedulingBooking.skillName,
            duration: reschedulingBooking.duration,
            providerName: reschedulingBooking.providerName,
            requesterName: reschedulingBooking.requesterName,
          }}
          existingBooking={reschedulingBooking}
          onSuccess={() => {
            fetchBookings();
            setReschedulingBooking(null);
          }}
        />
      )}
    </section>
  );
}
