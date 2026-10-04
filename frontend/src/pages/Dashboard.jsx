import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Sparkles, PlusCircle, Search, ArrowRight, LogOut, ShieldCheck, User, Bell, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import recommendationService from '../services/recommendationService';
import notificationService from '../services/notificationService';
import RecommendationCard from '../components/dashboard/RecommendationCard';
import UpcomingBookingsWidget from '../components/dashboard/UpcomingBookingsWidget';

export default function Dashboard() {
  const { user, walletBalance, logout } = useAuth();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        setLoadingRecs(true);
        const data = await recommendationService.getRecommendations();
        if (isMounted) {
          setRecommendations(Array.isArray(data) ? data : []);
          setRecsError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load recommendations:', err);
          setRecsError('Unable to load recommendations at this time.');
        }
      } finally {
        if (isMounted) {
          setLoadingRecs(false);
        }
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const countData = await notificationService.getUnreadCount();
        if (isMounted) {
          setUnreadNotifications(countData.count || 0);
        }
      } catch {
        // Gracefully ignore notification fetch error on dashboard
      }
    };

    fetchRecommendations();
    fetchUnreadCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Dashboard Topbar */}
      <nav className="bg-white border-b border-stone-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-amber-700 transition">
                S
              </div>
              <span className="font-display font-bold text-xl text-stone-900 tracking-tight">
                Skill<span className="text-amber-600">Swap</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Wallet Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 shadow-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold">
                  {walletBalance !== undefined && walletBalance !== null ? Number(walletBalance).toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-amber-700 font-medium">Credits</span>
              </div>

              {/* User Dropdown / Logout */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 text-sm font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Unread Notifications Alert Banner */}
        {unreadNotifications > 0 && (
          <div
            data-testid="unread-notifications-banner"
            className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-sm animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-200/60 text-amber-800 shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  You have {unreadNotifications} unread notification{unreadNotifications > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-800">
                  Community members have interacted with your skill exchanges, bookings, or reviews.
                </p>
              </div>
            </div>
            <Link
              to="/exchanges"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm shrink-0"
            >
              <span>View Exchanges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-900/10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-amber-100 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community Member</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
              Welcome back, {user?.name || 'Friend'}!
            </h1>
            <p className="mt-2 text-amber-100 text-sm sm:text-base leading-relaxed">
              Your time-credit wallet is active. Every hour of skill you share earns you 1 credit to learn whatever you need.
            </p>
          </div>

          {/* Decorative Background Element */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wallet Balance Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Time Credit Balance
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-stone-900 font-display">
                  {walletBalance !== undefined && walletBalance !== null ? Number(walletBalance).toFixed(1) : '5.0'}
                </span>
                <span className="text-sm font-semibold text-amber-600">Hours of Service</span>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Initial grant of 5 credits active. Server-verified balance.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ledger verified</span>
              </div>
              <Link
                to="/wallet"
                className="text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 hover:underline"
              >
                <span>View Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Offer Skills Action Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between group hover:border-amber-300 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Share Knowledge
                </span>
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition">
                  <PlusCircle className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-stone-900">List Your Skills</h2>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Add skills you can teach or help with to start receiving exchange requests from members.
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition cursor-pointer"
            >
              <span>Add or edit skills on your profile</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Discover Community Skills */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between group hover:border-amber-300 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Find a Match
                </span>
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-stone-900">Explore Catalog</h2>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Browse skills offered by neighborhood peers in programming, languages, design, and more.
              </p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition cursor-pointer"
            >
              <span>Browse skills</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Upcoming Skill Swaps (Scheduled Sessions) */}
        <UpcomingBookingsWidget />

        {/* Recommended Matches For You */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Smart Matching</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 font-display">
                Recommended Matches For You
              </h2>
              <p className="text-xs text-stone-500">
                Personalized matches based on your wanted skills, location, rating, and exchange reciprocity.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
            >
              <span>Explore All Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recommendations Content */}
          {loadingRecs ? (
            <div data-testid="recommendations-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm animate-pulse flex flex-col justify-between h-72"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-24 bg-stone-200 rounded-full" />
                      <div className="h-6 w-12 bg-stone-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-stone-200 rounded" />
                        <div className="h-3 w-1/2 bg-stone-200 rounded" />
                      </div>
                    </div>
                    <div className="h-16 bg-stone-100 rounded-2xl" />
                  </div>
                  <div className="h-10 bg-stone-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div data-testid="recommendations-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={`${rec.providerId}-${rec.matchedSkillName}`}
                  recommendation={rec}
                />
              ))}
            </div>
          ) : (
            <div
              data-testid="recommendations-empty"
              className="bg-white rounded-3xl p-8 border border-dashed border-stone-300 text-center max-w-xl mx-auto shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">
                No matches found yet
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-5">
                Add skills you want to learn to your profile so our recommendation engine can pair you with compatible community providers.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  <span>Add Wanted Skills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                >
                  <span>Browse Catalog</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Profile Details Mini-Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-4 flex-1">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <User className="w-4 h-4 text-stone-500" />
              <span>Account & Profile</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs text-stone-400 font-medium">Name</span>
                <span className="font-semibold text-stone-800">{user?.name}</span>
              </div>
              <div>
                <span className="block text-xs text-stone-400 font-medium">Email</span>
                <span className="font-semibold text-stone-800">{user?.email}</span>
              </div>
              <div>
                <span className="block text-xs text-stone-400 font-medium">Member Role</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                  {user?.role || 'ROLE_MEMBER'}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/profile"
            className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <span>Edit Profile & Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
