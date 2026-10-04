import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Sparkles, BookOpen, ExternalLink, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import AvatarPicker from '../components/profile/AvatarPicker';
import SkillBadge from '../components/profile/SkillBadge';
import SkillSelector from '../components/profile/SkillSelector';

export default function ProfileEdit() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    avatarUrl: '',
    offeredSkills: [],
    wantedSkills: [],
  });

  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' | 'SKILLS'

  const loadProfile = useCallback(async () => {
    try {
      const data = await profileService.getMyProfile();
      setProfile({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        location: data.location || '',
        avatarUrl: data.avatarUrl || '',
        offeredSkills: data.offeredSkills || [],
        wantedSkills: data.wantedSkills || [],
      });
    } catch {
      setError('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await profileService.updateProfile({
        name: profile.name.trim(),
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        avatarUrl: profile.avatarUrl,
      });

      setProfile((prev) => ({
        ...prev,
        name: updated.name,
        bio: updated.bio,
        location: updated.location,
        avatarUrl: updated.avatarUrl,
      }));

      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillPayload) => {
    try {
      const added = await profileService.addSkill(skillPayload);
      if (skillPayload.type === 'OFFERED') {
        setProfile((prev) => ({
          ...prev,
          offeredSkills: [...prev.offeredSkills, added],
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          wantedSkills: [...prev.wantedSkills, added],
        }));
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This skill is already in your list.');
      } else {
        setError('Failed to add skill.');
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveSkill = async (id, type) => {
    try {
      await profileService.removeSkill(id);
      if (type === 'OFFERED') {
        setProfile((prev) => ({
          ...prev,
          offeredSkills: prev.offeredSkills.filter((s) => s.id !== id),
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          wantedSkills: prev.wantedSkills.filter((s) => s.id !== id),
        }));
      }
    } catch {
      setError('Failed to remove skill.');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-amber-50 border border-stone-200 flex-shrink-0 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-amber-700">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
                {profile.name}
              </h1>
              <p className="text-xs text-stone-500">{profile.email}</p>
              {profile.location && (
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profile.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.id && (
              <Link
                to={`/members/${user.id}`}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-6 rounded-t-2xl border-t border-x border-stone-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'DETAILS'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SKILLS')}
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'SKILLS'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              Manage Skills ({profile.offeredSkills.length + profile.wantedSkills.length})
            </span>
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'DETAILS' && (
          <form
            onSubmit={handleSaveDetails}
            className="bg-white p-6 sm:p-8 rounded-b-2xl border-b border-x border-stone-200/80 shadow-sm space-y-6"
          >
            <AvatarPicker
              selectedAvatar={profile.avatarUrl}
              onSelect={(url) => setProfile((prev) => ({ ...prev, avatarUrl: url }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Display Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Location (City / State)
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={profile.location}
                  onChange={handleProfileChange}
                  placeholder="e.g. Austin, TX"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-stone-800 mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={profile.bio}
                onChange={handleProfileChange}
                placeholder="Tell the community what you know, your background, and what you are eager to learn..."
                className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Manage Skills */}
        {activeTab === 'SKILLS' && (
          <div className="bg-white p-6 sm:p-8 rounded-b-2xl border-b border-x border-stone-200/80 shadow-sm space-y-8">
            {/* Section 1: Skills I Can Share (Offered) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Skills I Can Share (Offered)</span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Services you provide to other members in exchange for time credits.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {profile.offeredSkills.length} listed
                </span>
              </div>

              {/* Current Offered Badges */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 min-h-[50px] flex flex-wrap gap-2 items-center">
                {profile.offeredSkills.length > 0 ? (
                  profile.offeredSkills.map((s) => (
                    <SkillBadge
                      key={s.id}
                      userSkill={s}
                      onRemove={(id) => handleRemoveSkill(id, 'OFFERED')}
                    />
                  ))
                ) : (
                  <span className="text-xs text-stone-400">
                    No skills offered yet. Add skills below to start receiving exchange requests.
                  </span>
                )}
              </div>

              {/* Selector to add more offered skills */}
              <SkillSelector
                type="OFFERED"
                onSelectSkill={handleAddSkill}
                existingSkillIds={profile.offeredSkills.map((s) => s.skillId).filter(Boolean)}
              />
            </div>

            {/* Section 2: Skills I Want to Learn (Wanted) */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Skills I Want to Learn (Wanted)</span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Topics you want help with using your earned time credits.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {profile.wantedSkills.length} listed
                </span>
              </div>

              {/* Current Wanted Badges */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 min-h-[50px] flex flex-wrap gap-2 items-center">
                {profile.wantedSkills.length > 0 ? (
                  profile.wantedSkills.map((s) => (
                    <SkillBadge
                      key={s.id}
                      userSkill={s}
                      onRemove={(id) => handleRemoveSkill(id, 'WANTED')}
                    />
                  ))
                ) : (
                  <span className="text-xs text-stone-400">
                    No learning goals added yet. Add skills below to help find compatible matches.
                  </span>
                )}
              </div>

              {/* Selector to add more wanted skills */}
              <SkillSelector
                type="WANTED"
                onSelectSkill={handleAddSkill}
                existingSkillIds={profile.wantedSkills.map((s) => s.skillId).filter(Boolean)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
