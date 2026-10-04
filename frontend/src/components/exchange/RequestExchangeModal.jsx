import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import exchangeService from '../../services/exchangeService';

const DURATION_OPTIONS = [1.0, 1.5, 2.0, 3.0];

export default function RequestExchangeModal({
  isOpen,
  onClose,
  provider,
  initialSkillId = null,
  onSuccess,
}) {
  const { walletBalance } = useAuth();

  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [duration, setDuration] = useState(1.0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Extract offered skills from provider
  const offeredSkills = provider?.offeredSkills || [];

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setNotes('');
      setDuration(1.0);

      // Pre-select skill if provided, or default to first offered skill
      if (initialSkillId && offeredSkills.some((s) => (s.skillId || s.id) === initialSkillId)) {
        setSelectedSkillId(String(initialSkillId));
      } else if (offeredSkills.length > 0) {
        setSelectedSkillId(String(offeredSkills[0].skillId || offeredSkills[0].id));
      } else {
        setSelectedSkillId('');
      }
    }
  }, [isOpen, initialSkillId, provider]);

  if (!isOpen || !provider) return null;

  const currentBalance = walletBalance !== undefined && walletBalance !== null ? Number(walletBalance) : 0;
  const isBalanceInsufficient = currentBalance < duration;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setError('Please select a skill to learn.');
      return;
    }

    if (isBalanceInsufficient) {
      setError(`Insufficient balance. You need ${duration.toFixed(1)} credits, but have ${currentBalance.toFixed(1)}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const resolvedSkill = offeredSkills.find(
        (s) => String(s.skillId || s.id) === String(selectedSkillId)
      );
      const skillIdToSubmit = resolvedSkill ? (resolvedSkill.skillId || resolvedSkill.id) : Number(selectedSkillId);

      const payload = {
        providerId: provider.id,
        skillId: Number(skillIdToSubmit),
        duration: Number(duration),
        notes: notes.trim(),
      };

      const result = await exchangeService.createExchange(payload);
      setSuccessMessage('Exchange request sent successfully!');

      if (onSuccess) {
        onSuccess(result);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit exchange request.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(provider.name || 'Member')}&backgroundColor=fef3c7`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200/60 flex-shrink-0">
            <img
              src={provider.avatarUrl || defaultAvatar}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 id="modal-headline" className="text-lg font-bold text-stone-900 font-display">
              Request Skill Exchange
            </h2>
            <p className="text-xs text-stone-500">
              with <span className="font-semibold text-stone-800">{provider.name}</span> &bull; {provider.location || 'Community Member'}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Skill Selection */}
          <div>
            <label htmlFor="skill-select" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Skill You Want to Learn <span className="text-rose-500">*</span>
            </label>
            {offeredSkills.length > 0 ? (
              <select
                id="skill-select"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              >
                {offeredSkills.map((s) => (
                  <option key={s.id || s.skillId} value={String(s.skillId || s.id)}>
                    {s.skillName} {s.category ? `(${s.category})` : ''} {s.experience ? `— ${s.experience}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-500">
                This member does not have any offered skills listed currently.
              </div>
            )}
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Proposed Duration <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-amber-700 font-semibold">
                1 Hour = 1 Credit
              </span>
            </div>

            {/* Quick Chips */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDuration(opt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    duration === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  {opt.toFixed(1)}h
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative mt-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8.0"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0.5)}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
              <span className="absolute right-4 top-2.5 text-xs text-stone-400 font-medium">
                Hours
              </span>
            </div>
          </div>

          {/* Credit Balance & Cost Summary Box */}
          <div className={`p-4 rounded-2xl border transition ${
            isBalanceInsufficient
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Credit Cost:</span>
              </span>
              <span className="text-sm font-extrabold font-display">
                {duration.toFixed(1)} Credits
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Your Available Balance:</span>
              <span className={`font-semibold ${isBalanceInsufficient ? 'text-rose-600' : 'text-stone-700'}`}>
                {currentBalance.toFixed(1)} Credits
              </span>
            </div>
            {isBalanceInsufficient && (
              <p className="mt-2 text-[11px] font-semibold text-rose-600">
                You do not have enough credits for this duration. Earn more by offering skills to the community.
              </p>
            )}
          </div>

          {/* Notes / Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Note or Message (Optional)
              </label>
              <span className="text-[11px] text-stone-400">
                {notes.length}/500
              </span>
            </div>
            <textarea
              id="notes"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Introduce yourself, share your learning goals, or suggest preferred meeting times..."
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isBalanceInsufficient || offeredSkills.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-warm disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {submitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Exchange Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
