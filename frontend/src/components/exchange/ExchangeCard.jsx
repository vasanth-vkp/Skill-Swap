import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Calendar,
  Award,
  MapPin,
  MessageSquare,
  Check,
  X,
  Trash2,
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    style: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Declined',
    style: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    style: 'bg-stone-100 text-stone-600 border-stone-200',
    icon: Ban,
  },
  SCHEDULED: {
    label: 'Scheduled',
    style: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Calendar,
  },
  COMPLETED: {
    label: 'Completed',
    style: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: Award,
  },
};

const CATEGORY_COLORS = {
  Technology: 'bg-blue-50 text-blue-700 border-blue-200',
  Languages: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Arts & Design': 'bg-purple-50 text-purple-700 border-purple-200',
  Academics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Trades & Practical': 'bg-amber-50 text-amber-700 border-amber-200',
  'Health & Wellness': 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function ExchangeCard({
  exchange,
  isIncoming = false,
  onAccept,
  onReject,
  onCancel,
}) {
  const [imageError, setImageError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!exchange) return null;

  const counterpartyName = isIncoming ? exchange.requesterName : exchange.providerName;
  const counterpartyId = isIncoming ? exchange.requesterId : exchange.providerId;
  const counterpartyAvatar = isIncoming ? exchange.requesterAvatar : exchange.providerAvatar;
  const counterpartyLocation = isIncoming ? exchange.requesterLocation : exchange.providerLocation;

  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(
    counterpartyName || 'Member'
  )}&backgroundColor=fef3c7`;

  const statusConfig = STATUS_CONFIG[exchange.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const categoryStyle = CATEGORY_COLORS[exchange.skillCategory] || 'bg-stone-50 text-stone-700 border-stone-200';

  const durationNumber = Number(exchange.duration || 1.0).toFixed(1);
  const formattedDate = exchange.createdAt
    ? new Date(exchange.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleAction = async (actionFn) => {
    if (!actionFn || actionLoading) return;
    try {
      setActionLoading(true);
      await actionFn(exchange.id);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      data-testid={`exchange-card-${exchange.id}`}
      className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Meta: Status Pill & Date */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            data-testid="exchange-status-badge"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statusConfig.style}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </span>

          {formattedDate && (
            <span className="text-[11px] text-stone-400 font-medium">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Counterparty Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200/60 flex-shrink-0">
            {counterpartyAvatar && !imageError ? (
              <img
                src={counterpartyAvatar}
                alt={counterpartyName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={defaultAvatar}
                alt={counterpartyName}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/members/${counterpartyId}`}
                className="text-base font-bold text-stone-900 hover:text-amber-600 transition-colors line-clamp-1"
              >
                {counterpartyName}
              </Link>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="line-clamp-1">{counterpartyLocation || 'Community Member'}</span>
            </div>
          </div>
        </div>

        {/* Requested Skill & Duration Row */}
        <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/60 mb-4">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {isIncoming ? 'Requested to Learn' : 'Skill You Want to Learn'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-bold">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{durationNumber} Hours ({durationNumber} Credits)</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-bold text-stone-900">
              {exchange.skillName}
            </span>
            {exchange.skillCategory && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${categoryStyle}`}>
                {exchange.skillCategory}
              </span>
            )}
          </div>
        </div>

        {/* Notes / Message */}
        {exchange.notes && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Note</span>
            </div>
            <p className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200/70 italic leading-relaxed">
              &ldquo;{exchange.notes}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-stone-100 mt-2">
        {isIncoming && exchange.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction(onAccept)}
              disabled={actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Accept Request</span>
            </button>
            <button
              onClick={() => handleAction(onReject)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Decline</span>
            </button>
          </div>
        )}

        {!isIncoming && exchange.status === 'PENDING' && (
          <button
            onClick={() => handleAction(onCancel)}
            disabled={actionLoading}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-700 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancel Request</span>
          </button>
        )}

        {exchange.status !== 'PENDING' && (
          <div className="text-center py-1">
            <span className="text-[11px] text-stone-400 font-medium">
              {exchange.status === 'ACCEPTED'
                ? 'Accepted — Scheduling in next step'
                : `Exchange ${statusConfig.label.toLowerCase()}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
