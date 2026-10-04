import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeRewardModal({ isOpen, onClose }) {
  const { walletBalance, dismissWelcomeModal } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToDashboard = () => {
    dismissWelcomeModal();
    if (onClose) onClose();
    navigate('/dashboard');
  };

  const handleExploreSkills = () => {
    dismissWelcomeModal();
    if (onClose) onClose();
    navigate('/explore');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F5] border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center transform animate-in zoom-in-95 duration-200">
        {/* Decorative Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shadow-inner mb-5">
          <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>

        {/* Sparkling Ribbon */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Welcome Gift Unlocked</span>
        </div>

        {/* Heading */}
        <h2 id="welcome-modal-title" className="text-2xl font-bold text-stone-900 mb-2 font-display">
          Welcome to SkillSwap!
        </h2>

        {/* Description */}
        <p className="text-sm text-stone-600 leading-relaxed mb-6">
          We have gifted you <strong className="text-stone-900 font-semibold">5 Time Credits</strong> to start exchanging skills with your community. 1 credit equals 1 hour of any skill.
        </p>

        {/* Credit Display Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between">
          <div className="text-left">
            <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
              Your Current Balance
            </span>
            <span className="text-2xl font-bold text-stone-900">
              {walletBalance !== undefined && walletBalance !== null ? Number(walletBalance).toFixed(1) : '5.0'}
              <span className="text-xs font-semibold text-amber-600 ml-1.5">Time Credits</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoToDashboard}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleExploreSkills}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-stone-100 text-stone-700 font-medium text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-stone-500" />
            <span>Explore Community Skills</span>
          </button>
        </div>
      </div>
    </div>
  );
}
