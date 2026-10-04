import React from 'react';
import { X, Sparkles, Award } from 'lucide-react';

const CATEGORY_COLORS = {
  Technology: 'bg-blue-50 text-blue-700 border-blue-200',
  Languages: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Arts & Design': 'bg-purple-50 text-purple-700 border-purple-200',
  Academics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Trades & Practical': 'bg-amber-50 text-amber-700 border-amber-200',
  'Health & Wellness': 'bg-teal-50 text-teal-700 border-teal-200',
};

const EXPERIENCE_BADGES = {
  BEGINNER: { label: 'Beginner', bg: 'bg-stone-100 text-stone-700 border-stone-200' },
  INTERMEDIATE: { label: 'Intermediate', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  ADVANCED: { label: 'Advanced', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function SkillBadge({ userSkill, onRemove }) {
  const { skillName, category, type, experience } = userSkill;
  const isOffered = type === 'OFFERED';
  const categoryStyle = CATEGORY_COLORS[category] || 'bg-stone-50 text-stone-700 border-stone-200';
  const expConfig = experience ? EXPERIENCE_BADGES[experience.toUpperCase()] : null;

  return (
    <div
      className={`inline-flex items-center gap-2 pl-3 ${
        onRemove ? 'pr-1.5' : 'pr-3'
      } py-1.5 rounded-full border shadow-xs text-xs font-medium transition ${categoryStyle}`}
    >
      <span className="font-semibold">{skillName}</span>

      {isOffered && expConfig && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${expConfig.bg}`}
        >
          <Award className="w-3 h-3" />
          <span>{expConfig.label}</span>
        </span>
      )}

      {!isOffered && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-stone-500" />
          <span>Wanted</span>
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(userSkill.id)}
          aria-label={`Remove ${skillName}`}
          className="w-5 h-5 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-white/80 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
