import React, { useState } from 'react';
import {
  Clock, Sparkles, Search, ArrowRight, CheckCircle2, Star,
  MapPin, Users, Award, ShieldCheck, Repeat, Zap, BookOpen
} from 'lucide-react';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [calcHours, setCalcHours] = useState(2);

  const categories = ['All', 'Technology', 'Languages', 'Academics', 'Trades & Repairs', 'Music & Arts', 'Wellness'];

  const sampleExchanges = [
    {
      id: 1,
      offered: 'Laptop Repair & Diagnostics',
      offeredCategory: 'Trades & Repairs',
      provider: 'Alex Mercer',
      location: 'Downtown, Seattle',
      rating: 4.9,
      reviews: 28,
      duration: '1.5 hrs',
      credits: '1.5 Credits',
      wanted: 'Mathematics Tutoring',
      avatarColor: 'from-amber-500 to-amber-600',
    },
    {
      id: 2,
      offered: 'Conversational Spanish',
      offeredCategory: 'Languages',
      provider: 'Elena Gomez',
      location: 'Capitol Hill, Seattle',
      rating: 5.0,
      reviews: 42,
      duration: '1.0 hr',
      credits: '1.0 Credit',
      wanted: 'Web Development / React',
      avatarColor: 'from-coral-500 to-rose-600',
    },
    {
      id: 3,
      offered: 'Acoustic Guitar for Beginners',
      offeredCategory: 'Music & Arts',
      provider: 'Marcus Chen',
      location: 'Ballard, Seattle',
      rating: 4.8,
      reviews: 19,
      duration: '2.0 hrs',
      credits: '2.0 Credits',
      wanted: 'Home Vegetable Gardening',
      avatarColor: 'from-emerald-500 to-teal-600',
    },
    {
      id: 4,
      offered: 'Calculus & Linear Algebra',
      offeredCategory: 'Academics',
      provider: 'Dr. Sarah Patel',
      location: 'University District, Seattle',
      rating: 4.95,
      reviews: 35,
      duration: '1.0 hr',
      credits: '1.0 Credit',
      wanted: 'Camera & Video Editing',
      avatarColor: 'from-indigo-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-20 pb-20">

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-200/40 via-coral-200/30 to-amber-100/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50 border border-amber-300/80 shadow-warm-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Welcome Offer: Get <span className="text-amber-600 font-extrabold">5 Free Time Credits</span> on signup
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Share What You Know. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-coral-500 to-amber-500">
                Learn What You Need.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              SkillSwap is a money-free community network where members exchange everyday skills using time credits.
              <strong className="text-slate-800 font-semibold"> 1 hour given = 1 credit earned.</strong>
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl mx-auto bg-white p-2.5 rounded-3xl shadow-warm-lg border border-cream-300 transition-all focus-within:ring-2 focus-within:ring-amber-500/50">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 px-3 py-2 w-full">
                <Search className="w-5 h-5 text-amber-500 shrink-0" />
                <input
                  type="text"
                  placeholder="What skill do you want to learn? (e.g. Guitar, Python, Spanish)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-slate-800 placeholder-slate-400 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <a
                href="/register"
                className="w-full sm:w-auto shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-warm transition-all flex items-center justify-center gap-2"
              >
                <span>Find Skills</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-warm'
                    : 'bg-cream-50 text-slate-600 border border-cream-300 hover:border-amber-400 hover:bg-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base font-bold text-white bg-gradient-to-r from-amber-500 via-amber-600 to-coral-500 hover:from-amber-600 hover:to-coral-600 px-8 py-4 rounded-2xl shadow-warm-lg hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Swapping (+5 Credits)</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-cream-50 border border-cream-300 px-7 py-4 rounded-2xl shadow-warm-sm transition-all"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-cream-200/80">
            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Money Involved</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>1 Hour = 1 Credit</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Verified Dual Review</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Atomic Credit Ledger</span>
            </div>
          </div>

        </div>
      </section>


      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 font-display">
            Simple 3-Step Economy
          </h2>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            How SkillSwap Works
          </p>
          <p className="text-slate-600 text-base">
            No bargaining over hourly rates. Everyone’s hour is valued equally in our community time bank.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-warm relative group hover:border-amber-400 hover:shadow-warm-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="text-xs font-extrabold text-amber-600 tracking-wider uppercase">Step 01</span>
            <h3 className="text-xl font-display font-bold text-slate-900 mt-1 mb-3">
              Offer & Request Skills
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              List what you know—from coding and baking to plumbing or calculus. Specify what you need help with. Everyone has something valuable to teach.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-warm relative group hover:border-amber-400 hover:shadow-warm-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-coral-100 text-coral-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <span className="text-xs font-extrabold text-coral-600 tracking-wider uppercase">Step 02</span>
            <h3 className="text-xl font-display font-bold text-slate-900 mt-1 mb-3">
              Book & Provide Service
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Match with compatible community members. Coordinate a convenient time, date, and duration. Deliver help in-person or virtually.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-warm relative group hover:border-amber-400 hover:shadow-warm-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7" />
            </div>
            <span className="text-xs font-extrabold text-emerald-600 tracking-wider uppercase">Step 03</span>
            <h3 className="text-xl font-display font-bold text-slate-900 mt-1 mb-3">
              Confirm & Settle Credits
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Both parties verify completion. The ledger automatically transfers time credits (1 hr = 1 credit). Rate and review each other to build reputation.
            </p>
          </div>

        </div>
      </section>


      {/* 3. POPULAR SKILL EXCHANGES SHOWCASE */}
      <section id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        {/* Anchor alias for community nav link */}
        <div id="community" className="absolute -mt-24" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 font-display">
              Live Community Directory
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              Popular Skill Exchanges
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Explore skills members are offering right now in exchange for time credits.
            </p>
          </div>
          <a
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 shrink-0"
          >
            <span>View All Members</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleExchanges.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-cream-300 shadow-warm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cream-200 text-slate-700">
                    {item.offeredCategory}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.rating}</span>
                    <span className="text-slate-400 font-normal">({item.reviews})</span>
                  </div>
                </div>

                {/* Skill Title */}
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.offered}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.location}
                  </p>
                </div>

                {/* Wanted Skill Match Box */}
                <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Looking for in return:
                  </span>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{item.wanted}</span>
                  </p>
                </div>
              </div>

              {/* Card Footer: Provider & CTA */}
              <div className="pt-5 mt-5 border-t border-cream-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${item.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {item.provider.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.provider}</p>
                    <p className="text-[10px] font-semibold text-amber-600">{item.credits}</p>
                  </div>
                </div>
                <a
                  href="/register"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 transition-colors"
                  title="Request Exchange"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 4. TIME-CREDIT VALUE EXPLAINER & SIMULATOR */}
      <section id="time-credit" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-warm-lg border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                <span>The Core Economic Invariant</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                1 Hour of Service = 1 Time Credit. <br />
                <span className="text-amber-400">Equal Value for Everyone.</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Traditional money treats an hour of coding differently from an hour of language tutoring or bike repair.
                At SkillSwap, human time is inherently equal. Everyone gives an hour, everyone gets an hour.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5 Time Credits granted automatically upon registration</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Credits transferred strictly server-side within ACID transactions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dual confirmation required before credit transfer executes</span>
                </li>
              </ul>
            </div>

            {/* Interactive Credit Simulator Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">
                  Time-Credit Simulator
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500 text-slate-900 font-extrabold">
                  Interactive
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Hours you contribute:</span>
                  <span className="text-amber-400 font-bold">{calcHours} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={calcHours}
                  onChange={(e) => setCalcHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 Hour</span>
                  <span>5 Hours</span>
                  <span>10 Hours</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">You Earn:</span>
                  <span className="text-xl font-display font-extrabold text-emerald-400">
                    +{calcHours} Time Credits
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Which you can spend on:</span>
                  <span className="text-xs font-bold text-white">
                    {calcHours} hrs of any community skill
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-normal bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                💡 <em>Example:</em> Teaching {calcHours} hours of piano earns you enough credits for {calcHours} hours of Spanish lessons or plumbing assistance!
              </div>

              <a
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm transition-all"
              >
                <span>Claim Your Initial 5 Credits</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
