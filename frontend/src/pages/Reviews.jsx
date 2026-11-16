import React, { useState, useEffect } from 'react';
import { Star, Sparkles, AlertCircle, Loader2, ArrowLeftRight, CheckCircle2, MessageSquare, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import exchangeService from '../services/exchangeService';
import SubmitReviewModal from '../components/review/SubmitReviewModal';

export default function Reviews() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'pending-review'
    const [receivedReviews, setReceivedReviews] = useState([]);
    const [completedExchanges, setCompletedExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for submitting review
    const [selectedExchange, setSelectedExchange] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReviewsData = async () => {
        if (!user || !user.id) return;
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch reviews received by current user
            const reviewsData = await reviewService.getReviewsForMember(user.id);
            setReceivedReviews(Array.isArray(reviewsData) ? reviewsData : []);

            // 2. Fetch completed exchanges (incoming & outgoing) to find eligible ones for review
            const [incoming, outgoing] = await Promise.all([
                exchangeService.getIncomingExchanges('COMPLETED').catch(() => []),
                exchangeService.getOutgoingExchanges('COMPLETED').catch(() => []),
            ]);

            const allCompleted = [...(incoming || []), ...(outgoing || [])];
            // Remove duplicates by exchange id
            const uniqueCompleted = Array.from(new Map(allCompleted.map(ex => [ex.id, ex])).values());

            // Filter out exchanges where user is reviewing themselves (safety check)
            const validCompleted = uniqueCompleted.filter(ex => {
                const partnerId = ex.requesterId === user.id ? ex.providerId : ex.requesterId;
                return partnerId && partnerId !== user.id;
            });

            setCompletedExchanges(validCompleted);
        } catch (err) {
            console.error('Failed to load reviews data:', err);
            setError('Failed to load reviews and completed exchanges. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewsData();
    }, [user]);

    const handleOpenReviewModal = (exchange) => {
        setSelectedExchange(exchange);
        setIsModalOpen(true);
    };

    const handleReviewSuccess = () => {
        setIsModalOpen(false);
        setSelectedExchange(null);
        fetchReviewsData();
    };

    // Calculate average rating
    const avgRating = receivedReviews.length > 0
        ? (receivedReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / receivedReviews.length).toFixed(1)
        : '5.0';

    return (
        <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-warm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 tracking-wide uppercase font-display">
                                Reputation & Feedback
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                            Skill Exchange Reviews
                        </h1>
                        <p className="text-slate-600 text-sm sm:text-base">
                            Manage feedback received from community members and review your completed sessions.
                        </p>
                    </div>

                    {/* Aggregate Stats Card */}
                    <div className="flex items-center gap-4 bg-amber-50/80 border border-amber-200/60 px-6 py-4 rounded-2xl shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-display font-bold text-xl shadow-warm">
                            {avgRating}
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-4 h-4 ${s <= Math.round(Number(avgRating))
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-stone-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs font-semibold text-amber-900 mt-1">
                                {receivedReviews.length} Verified Review{receivedReviews.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div role="alert" className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-stone-200 gap-8">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'received'
                                ? 'border-amber-600 text-amber-700'
                                : 'border-transparent text-stone-500 hover:text-stone-800'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Reviews Received ({receivedReviews.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('pending-review')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'pending-review'
                                ? 'border-amber-600 text-amber-700'
                                : 'border-transparent text-stone-500 hover:text-stone-800'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed Exchanges ({completedExchanges.length})</span>
                    </button>
                </div>

                {/* Tab Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                        <p className="text-sm font-medium text-stone-500">Loading reviews...</p>
                    </div>
                ) : activeTab === 'received' ? (
                    /* REVIEWS RECEIVED LIST */
                    receivedReviews.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-warm space-y-4">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                                <Star className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 font-display">No reviews received yet</h3>
                            <p className="text-sm text-stone-500 max-w-md mx-auto">
                                Complete skill exchanges and exchange feedback with members to build your community reputation.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {receivedReviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-warm space-y-4 flex flex-col justify-between hover:shadow-warm-lg transition-all"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                                                    {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : 'M'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">
                                                        {review.reviewerName || 'Community Member'}
                                                    </h4>
                                                    <p className="text-xs text-stone-400">
                                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <span className="text-xs font-bold text-amber-900">{review.rating}.0</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-700 text-sm leading-relaxed italic bg-stone-50/60 p-3.5 rounded-2xl border border-stone-100">
                                            &ldquo;{review.comment || 'Great exchange session!'}&rdquo;
                                        </p>
                                    </div>

                                    {review.skillTitle && (
                                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                                            <span>Skill: <strong className="text-slate-800">{review.skillTitle}</strong></span>
                                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">Verified Exchange</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* COMPLETED EXCHANGES ELIGIBLE FOR REVIEW */
                    completedExchanges.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-warm space-y-4">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                                <ArrowLeftRight className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 font-display">No completed exchanges to review</h3>
                            <p className="text-sm text-stone-500 max-w-md mx-auto">
                                Once you complete scheduled skill exchange sessions with other members, they will appear here so you can submit reviews.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Select a completed session to rate and review:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {completedExchanges.map((exchange) => {
                                    const partnerName =
                                        exchange.requesterId === user.id
                                            ? exchange.providerName || 'Provider'
                                            : exchange.requesterName || 'Requester';

                                    return (
                                        <div
                                            key={exchange.id}
                                            className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-warm flex flex-col justify-between space-y-4"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Completed
                                                    </span>
                                                    <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                                                        {exchange.duration || 1} hr credit{exchange.duration > 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-base">
                                                        {exchange.skillTitle || exchange.skill?.title || 'Skill Session'}
                                                    </h4>
                                                    <p className="text-xs text-stone-500 mt-0.5">
                                                        Exchange Partner: <strong className="text-slate-800">{partnerName}</strong>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                                                <span className="text-xs text-stone-400">
                                                    {exchange.completedAt ? new Date(exchange.completedAt).toLocaleDateString() : 'Finished'}
                                                </span>
                                                <button
                                                    onClick={() => handleOpenReviewModal(exchange)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>Submit Review</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}

                {/* Submit Review Modal */}
                <SubmitReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    exchange={selectedExchange}
                    onSuccess={handleReviewSuccess}
                />

            </div>
        </div>
    );
}
