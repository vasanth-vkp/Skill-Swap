import React, { useState } from 'react';
import { Clock, Sparkles, Menu, X, ArrowRight, User } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
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
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#explore" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              Explore Skills
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              How It Works
            </a>
            <a href="#time-credit" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              Time Credits
            </a>
            <a href="#community" className="text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors">
              Community
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-cream-200 transition-all flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-slate-500" />
              Sign In
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-coral-500 hover:from-amber-600 hover:to-coral-600 px-5 py-2.5 rounded-2xl shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get 5 Free Credits</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-cream-200 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-cream-300 bg-cream-50 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-cream-200"
          >
            Explore Skills
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-cream-200"
          >
            How It Works
          </a>
          <a
            href="#time-credit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-cream-200"
          >
            Time Credits
          </a>
          <div className="pt-3 border-t border-cream-200 flex flex-col gap-2">
            <a
              href="/login"
              className="text-center font-semibold text-slate-700 py-2.5 rounded-xl bg-cream-200"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="text-center font-bold text-white bg-gradient-to-r from-amber-500 to-coral-500 py-2.5 rounded-2xl shadow-warm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Get 5 Free Credits
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
