import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, Menu, X, ArrowRight, User, LayoutDashboard, ArrowLeftRight, Wallet, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, walletBalance, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-coral-500 flex items-center justify-center text-white shadow-warm group-hover:scale-105 transition-transform duration-200">
                <Clock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  Skill<span className="text-amber-600">Swap</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wide -mt-1">
                  Exchange Skills, Not Money
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/explore" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              Explore Skills
            </Link>
            <Link to="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              How It Works
            </Link>
            <Link to="/#time-credit" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              Time Credits
            </Link>
            <Link to="/#community" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              Community
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <NotificationBell />

                {/* Wallet Balance Pill */}
                <Link
                  to="/wallet"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 shadow-sm text-xs font-bold transition-all group cursor-pointer"
                  title="View Time-Credit Wallet & Transaction History"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span>{walletBalance !== undefined && walletBalance !== null ? Number(walletBalance).toFixed(1) : '5.0'}</span>
                  <span className="text-amber-700 font-medium">Credits</span>
                </Link>

                {/* Wallet Link */}
                <Link
                  to="/wallet"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-stone-100 transition"
                >
                  <Wallet className="w-4 h-4 text-stone-500" />
                  <span>Wallet</span>
                </Link>

                {/* Exchanges Link */}
                <Link
                  to="/exchanges"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-stone-100 transition"
                >
                  <ArrowLeftRight className="w-4 h-4 text-stone-500" />
                  <span>Exchanges</span>
                </Link>

                {/* Reviews Link */}
                <Link
                  to="/reviews"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-stone-100 transition"
                >
                  <Star className="w-4 h-4 text-stone-500" />
                  <span>Reviews</span>
                </Link>

                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-stone-100 transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-stone-500" />
                  <span>Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-stone-100 transition-all flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-coral-500 hover:from-amber-600 hover:to-coral-600 px-5 py-2.5 rounded-2xl shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get 5 Free Credits</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-stone-200 bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-stone-100"
          >
            Explore Skills
          </Link>
          <Link
            to="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-stone-100"
          >
            How It Works
          </Link>
          <Link
            to="/#time-credit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-stone-100"
          >
            Time Credits
          </Link>
          <Link
            to="/reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-stone-100"
          >
            Reviews
          </Link>
          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center font-bold text-amber-900 bg-amber-50 border border-amber-200/80 py-2.5 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-amber-600" />
                  <span>Wallet ({walletBalance !== undefined && walletBalance !== null ? Number(walletBalance).toFixed(1) : '5.0'} Credits)</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center font-bold text-white bg-amber-600 py-2.5 rounded-2xl shadow-warm flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center font-semibold text-slate-700 py-2.5 rounded-xl bg-stone-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center font-bold text-white bg-gradient-to-r from-amber-500 to-coral-500 py-2.5 rounded-2xl shadow-warm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Get 5 Free Credits
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
