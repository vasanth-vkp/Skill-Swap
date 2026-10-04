import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import notificationService from '../../services/notificationService';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {
      // Gracefully ignore fetch errors for count polling
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
      // Also update unread count based on loaded data
      const unread = (data || []).filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      // Gracefully ignore fetch errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click dismissal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore error
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore error
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);

    // Route based on notification type
    switch (notif.type) {
      case 'CREDIT_TRANSFERRED':
        navigate('/wallet');
        break;
      case 'REVIEW_RECEIVED':
        navigate('/profile');
        break;
      case 'REQUEST_RECEIVED':
      case 'REQUEST_ACCEPTED':
      case 'REQUEST_DECLINED':
      case 'BOOKING_SCHEDULED':
      case 'SERVICE_COMPLETED':
      default:
        navigate('/exchanges');
        break;
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'REQUEST_RECEIVED':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'REQUEST_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'REQUEST_DECLINED':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'BOOKING_SCHEDULED':
        return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'SERVICE_COMPLETED':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'CREDIT_TRANSFERRED':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'REVIEW_RECEIVED':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-stone-700 hover:text-amber-600 hover:bg-stone-100 transition-all focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          data-testid="notification-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-stone-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium text-stone-600">No notifications yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  We'll alert you when requests, bookings, or reviews arrive!
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-white hover:bg-stone-50/80 text-stone-600'
                      : 'bg-amber-50/40 hover:bg-amber-50/80 text-slate-900 font-medium'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-stone-100 mt-0.5 shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-stone-700' : 'text-slate-900 font-semibold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-stone-400">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="text-[10px] font-semibold text-amber-600 hover:text-amber-800"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2 bg-stone-50/60 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/exchanges');
              }}
              className="text-xs font-semibold text-stone-600 hover:text-amber-600 inline-flex items-center gap-1 transition"
            >
              <span>View all exchanges & sessions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
