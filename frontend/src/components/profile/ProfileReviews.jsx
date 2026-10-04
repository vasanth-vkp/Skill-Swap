import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, MessageSquareHeart, Loader2 } from 'lucide-react';
import reviewService from '../../services/reviewService';

export default function ProfileReviews({ memberId, ratingAverage, totalReviews }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      if (!memberId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await reviewService.getReviewsForMember(memberId);
        if (isMounted) {
          setReviews(data || []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load reviews at this time.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const displayRating = ratingAverage != null ? Number(ratingAverage).toFixed(1) : '5.0';
  const displayTotal = totalReviews != null ? totalReviews : reviews.length;

  return (
    <div
      data-testid="profile-reviews-section"
      className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6"
    >
      {/* Header with Title and Overall Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Community Reviews & Reputation</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Feedback from verified two-party skill exchanges
          </p>
        </div>

        {/* Aggregate Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-amber-50/70 border border-amber-200/80 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold font-display text-amber-800">
              {displayRating}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <Star
                  key={starIndex}
                  className={`w-4 h-4 ${
                    starIndex <= Math.round(Number(displayRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-stone-300">|</span>
          <div className="text-xs font-semibold text-stone-600">
            {displayTotal} {displayTotal === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-8 flex justify-center items-center text-stone-400 gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          <span>Loading community feedback...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p className="text-xs text-rose-600 text-center py-4">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && reviews.length === 0 && (
        <div
          data-testid="no-reviews-empty-state"
          className="text-center py-8 px-4 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-1">No reviews yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Complete a skill exchange with this member to receive community feedback and build reputation!
          </p>
        </div>
      )}

      {/* Reviews list */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const formattedDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently';

            const reviewerInitial = rev.reviewerName
              ? rev.reviewerName.charAt(0).toUpperCase()
              : 'M';

            return (
              <div
                key={rev.id}
                data-testid={`review-item-${rev.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50/60 border border-stone-200/70 hover:border-amber-200 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 font-bold text-sm flex items-center justify-center border border-amber-200/60">
                      {reviewerInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-stone-900">
                          {rev.reviewerName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Swap Participant" />
                      </div>
                      <p className="text-[11px] text-stone-400">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rev.skillTitle && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 border border-amber-200/80 text-amber-900">
                        {rev.skillTitle}
                      </span>
                    )}
                    <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-amber-500 text-xs font-bold shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-100 italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
