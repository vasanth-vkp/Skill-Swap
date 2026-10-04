import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import reviewService from '../../services/reviewService';

const RATING_LABELS = {
  1: '1 - Needs Improvement',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent!',
};

export default function SubmitReviewModal({
  isOpen,
  onClose,
  exchange,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !exchange) return null;

  const currentDisplayRating = hoverRating || rating;
  const ratingDescription = currentDisplayRating
    ? RATING_LABELS[currentDisplayRating]
    : 'Select a rating from 1 to 5 stars';

  const partnerName =
    exchange.partnerName ||
    exchange.counterpartyName ||
    exchange.providerName ||
    exchange.requesterName ||
    'Community Member';

  const skillTitle =
    exchange.skillTitle ||
    exchange.skill?.title ||
    'Skill Exchange';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newReview = await reviewService.createReview({
        exchangeId: exchange.id,
        rating,
        comment: comment.trim(),
      });
      if (onSuccess) {
        onSuccess(newReview);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit review. You may have already reviewed this exchange.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="review-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Review Skill Exchange
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {skillTitle} with <span className="font-semibold text-slate-700 dark:text-slate-200">{partnerName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Star Rating Selector */}
          <div className="space-y-2 text-center">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Rate your exchange experience
            </label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= currentDisplayRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    data-testid={`star-${starValue}`}
                    aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 rounded-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-transform"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p
              data-testid="rating-description"
              className={`text-sm font-medium transition-colors ${
                currentDisplayRating
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {ratingDescription}
            </p>
          </div>

          {/* Comment Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Feedback & Notes (Optional)
              </label>
              <span className="text-xs text-slate-400">
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience learning or exchanging with this member..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
