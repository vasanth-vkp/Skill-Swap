import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Sparkles, PlusCircle, Search, ArrowRight, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, walletBalance, logout } = useAuth();
  const navigate = useNavigate();

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
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ledger balance verified</span>
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
              onClick={() => navigate('/skills/new')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition"
            >
              <span>Add a skill to your profile</span>
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
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition"
            >
              <span>Browse skills</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Profile Details Mini-Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
          <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-stone-500" />
            <span>Account Details</span>
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
      </main>
    </div>
  );
}
