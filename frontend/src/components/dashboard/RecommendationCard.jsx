import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Star, MapPin, ArrowRight, Award, Sparkles, CheckCircle2 } from 'lucide-react';

const CATEGORY_COLORS = {
  Technology: 'bg-blue-50 text-blue-700 border-blue-200',
  Languages: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Arts & Design': 'bg-purple-50 text-purple-700 border-purple-200',
  Academics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Trades & Practical': 'bg-amber-50 text-amber-700 border-amber-200',
  'Health & Wellness': 'bg-teal-50 text-teal-700 border-teal-200',
};

const EXPERIENCE_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function RecommendationCard({ recommendation }) {
  const [imageError, setImageError] = useState(false);

  if (!recommendation) return null;

  const {
    providerId,
    providerName,
    providerAvatar,
    providerLocation,
    providerRating,
    matchedSkillName,
    matchedSkillCategory,
    experienceLevel,
    compatibilityPercentage = 0,
    isMutualMatch = false,
    matchReasons = [],
  } = recommendation;

  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(providerName || 'Member')}&backgroundColor=fef3c7`;
  const rating = providerRating != null ? Number(providerRating).toFixed(1) : '5.0';
  const categoryStyle = CATEGORY_COLORS[matchedSkillCategory] || 'bg-stone-50 text-stone-700 border-stone-200';
  const expLabel = experienceLevel ? (EXPERIENCE_LABELS[experienceLevel.toUpperCase()] || experienceLevel) : null;

  const matchPillStyle = compatibilityPercentage >= 80
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
    : 'bg-amber-50 text-amber-800 border-amber-200/90';

  return (
    <div
      data-testid={`recommendation-card-${providerId}`}
      className="group bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Badges Row: Match % and Mutual Match Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              data-testid="match-percentage"
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${matchPillStyle}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{compatibilityPercentage}% Match</span>
            </span>

            {isMutualMatch && (
              <span
                data-testid="mutual-match-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
              >
                <Repeat className="w-3.5 h-3.5 text-amber-700" />
                <span>Mutual Match</span>
              </span>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50/80 border border-amber-200/60 text-amber-950 text-xs font-bold flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Provider Profile Info */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200/60 flex-shrink-0">
            {providerAvatar && !imageError ? (
              <img
                src={providerAvatar}
                alt={providerName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={defaultAvatar}
                alt={providerName}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <Link
              to={`/members/${providerId}`}
              className="text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1"
            >
              {providerName}
            </Link>
            <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="line-clamp-1">{providerLocation || 'Community Member'}</span>
            </div>
          </div>
        </div>

        {/* Matched Skill Highlight */}
        <div className="bg-stone-50/80 rounded-2xl p-3.5 border border-stone-200/60 mb-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
            Teaches Skill
          </span>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-bold text-stone-900">
              {matchedSkillName}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {matchedSkillCategory && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${categoryStyle}`}>
                  {matchedSkillCategory}
                </span>
              )}
              {expLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-stone-700 border border-stone-200 uppercase tracking-wider">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>{expLabel}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Why this match: Match Reasons */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="mb-4">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Why this match
            </span>
            <ul className="space-y-1.5 text-xs text-stone-600">
              {matchReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-3 border-t border-stone-100 mt-2">
        <Link
          to={`/members/${providerId}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all group-hover:bg-amber-600"
        >
          <span>Request Exchange</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
