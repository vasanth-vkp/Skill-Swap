import React from 'react';
import { Clock, Heart, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-coral-500 flex items-center justify-center text-white shadow-warm">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                Skill<span className="text-amber-500">Swap</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              A community-powered platform where neighbors and professionals exchange skills using time credits instead of money. 1 hour of help equals 1 time credit. Simple, fair, and cooperative.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-amber-400 border border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>5 Free Credits on Signup</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Peer Reviews</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#explore" className="hover:text-amber-400 transition-colors">Search Skills</a></li>
              <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a></li>
              <li><a href="#time-credit" className="hover:text-amber-400 transition-colors">Time Credit System</a></li>
              <li><a href="/register" className="hover:text-amber-400 transition-colors">Join Community</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Skill Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Technology & Coding</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Languages & Tutoring</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Academics & Math</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Trades & Repair</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Arts & Music</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Wellness & Fitness</span></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Trust & Governance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Ledger Transparency</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Community Standards</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Two-Party Verification</span></li>
              <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Dispute Resolution</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SkillSwap Community Platform. Built with care for cooperative skill sharing.</p>
          <p className="flex items-center gap-1">
            Exchange skills with <Heart className="w-3.5 h-3.5 text-coral-500 fill-coral-500" /> in your community
          </p>
        </div>
      </div>
    </footer>
  );
}
