import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          Welcome back to SkillSwap
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Sign in to access your skills, exchanges, and time credit wallet.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-200/80">
          <LoginForm />

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-600">
              New to SkillSwap?{' '}
              <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                Join now & receive 5 credits
              </Link>
            </p>
          </div>
        </div>

        {/* Economic Invariant Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" /> 1 hr = 1 credit
          </span>
          <span>•</span>
          <span>Community reciprocity</span>
          <span>•</span>
          <span>Protected ledger</span>
        </div>
      </div>
    </div>
  );
}
