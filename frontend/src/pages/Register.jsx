import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';
import WelcomeRewardModal from '../components/auth/WelcomeRewardModal';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { newlyRegistered } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Welcome Reward Celebration Modal */}
      <WelcomeRewardModal isOpen={newlyRegistered} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo / Badge */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-amber-700 transition">
            S
          </div>
          <span className="font-display font-bold text-2xl text-stone-900 tracking-tight">
            Skill<span className="text-amber-600">Swap</span>
          </span>
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-stone-900 font-display tracking-tight">
          Join your skill exchange community
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Get started with{' '}
          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" /> 5 complimentary time credits
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-200/80">
          <RegisterForm />

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Value Prop Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" /> 1 hr given = 1 hr earned
          </span>
          <span>•</span>
          <span>Zero money involved</span>
          <span>•</span>
          <span>Instant setup</span>
        </div>
      </div>
    </div>
  );
}
