import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Star, Sparkles, BookOpen, ArrowLeft, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import SkillBadge from '../components/profile/SkillBadge';
import RequestExchangeModal from '../components/exchange/RequestExchangeModal';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      const data = await profileService.getPublicMember(id);
      setMember(data);
    } catch {
      setError('Member profile not found or unavailable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Profile Not Found</h2>
        <p className="text-sm text-stone-600 mb-6">{error || 'This member does not exist.'}</p>
        <Link
          to="/"
          className="px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = user && Number(user.id) === Number(member.id);

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/members/${id}` } });
      return;
    }
    setModalOpen(true);
  };

  const memberSinceFormatted = member.memberSince
    ? new Date(member.memberSince).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore</span>
          </Link>
        </div>

        {/* Member Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-amber-50 border-2 border-stone-200 flex-shrink-0 flex items-center justify-center shadow-xs">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-amber-700">
                  {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display text-stone-900">{member.name}</h1>
                <span title="Verified Member" className="text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                {member.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{member.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Joined {memberSinceFormatted}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{member.ratingAverage ? Number(member.ratingAverage).toFixed(1) : '5.0'}</span>
                  <span className="text-stone-400 font-normal">
                    ({member.totalReviews ?? 0} reviews)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          {isOwnProfile ? (
            <Link
              to="/profile"
              className="w-full sm:w-auto py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-stone-500" />
              <span>Edit Your Profile</span>
            </Link>
          ) : (
            <button
              onClick={handleRequestClick}
              className="w-full sm:w-auto py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Request Skill Exchange</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Member Bio */}
        {member.bio && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">About</h2>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{member.bio}</p>
          </div>
        )}

        {/* Skills Offered Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Skills Offered ({member.offeredSkills?.length ?? 0})</span>
            </h2>
            <span className="text-xs text-stone-500">1 hour = 1 time credit</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {member.offeredSkills && member.offeredSkills.length > 0 ? (
              member.offeredSkills.map((s) => <SkillBadge key={s.id} userSkill={s} />)
            ) : (
              <p className="text-xs text-stone-400">No skills currently offered by this member.</p>
            )}
          </div>
        </div>

        {/* Skills Wanted Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Learning Goals / Skills Wanted ({member.wantedSkills?.length ?? 0})</span>
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {member.wantedSkills && member.wantedSkills.length > 0 ? (
              member.wantedSkills.map((s) => <SkillBadge key={s.id} userSkill={s} />)
            ) : (
              <p className="text-xs text-stone-400">No learning goals listed yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Request Exchange Modal */}
      {modalOpen && (
        <RequestExchangeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          provider={member}
          onSuccess={() => {
            // Optional callback on success
          }}
        />
      )}
    </div>
  );
}
