import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight, User } from 'lucide-react';
import SkillBadge from '../profile/SkillBadge';

export default function ProviderCard({ provider }) {
  const [imageError, setImageError] = useState(false);

  if (!provider) return null;

  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(provider.name || 'Member')}&backgroundColor=fef3c7`;
  const rating = provider.averageRating != null ? Number(provider.averageRating).toFixed(1) : '5.0';
  const reviewCount = provider.totalReviews != null ? provider.totalReviews : 0;
  const offered = provider.offeredSkills || [];
  const wanted = provider.wantedSkills || [];

  return (
    <div
      data-testid={`provider-card-${provider.id}`}
      className="group bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Avatar, Name, Location, Rating */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200/60 flex-shrink-0">
              {provider.avatarUrl && !imageError ? (
                <img
                  src={provider.avatarUrl}
                  alt={provider.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={defaultAvatar}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <Link
                to={`/members/${provider.id}`}
                className="text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1"
              >
                {provider.name}
              </Link>
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                <span className="line-clamp-1">{provider.location || 'Community Member'}</span>
              </div>
            </div>
          </div>

          {/* Rating Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50/80 border border-amber-200/60 text-amber-950 text-xs font-bold flex-shrink-0 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{rating}</span>
            <span className="text-stone-400 font-normal">({reviewCount})</span>
          </div>
        </div>

        {/* Bio */}
        {provider.bio ? (
          <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-4">
            {provider.bio}
          </p>
        ) : (
          <p className="text-xs text-stone-400 italic mb-4">
            Available for skill exchanges and community learning.
          </p>
        )}

        {/* Offered Skills */}
        <div className="mb-4">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
            Skills Offered ({offered.length})
          </span>
          {offered.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {offered.slice(0, 3).map((skill) => (
                <SkillBadge
                  key={skill.id || skill.skillId}
                  userSkill={{
                    ...skill,
                    type: 'OFFERED',
                  }}
                />
              ))}
              {offered.length > 3 && (
                <span className="text-[11px] font-semibold text-stone-400 self-center px-1.5 py-0.5 rounded-full bg-stone-100">
                  +{offered.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-stone-400">No offered skills listed</span>
          )}
        </div>

        {/* Wanted Skills */}
        {wanted.length > 0 && (
          <div className="mb-5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Wants to Learn
            </span>
            <div className="flex flex-wrap gap-1.5">
              {wanted.slice(0, 3).map((skill) => (
                <span
                  key={skill.id || skill.skillId}
                  className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200/60"
                >
                  {skill.skillName}
                </span>
              ))}
              {wanted.length > 3 && (
                <span className="text-[11px] text-stone-400 self-center">
                  +{wanted.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <div className="pt-2 border-t border-stone-100 mt-2">
        <Link
          to={`/members/${provider.id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all group-hover:bg-amber-600"
        >
          <span>View Profile & Request</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
