import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, FileText, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvatarPicker from '../components/profile/AvatarPicker';
import SkillSelector from '../components/profile/SkillSelector';
import SkillBadge from '../components/profile/SkillBadge';
import profileService from '../services/profileService';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Profile Details
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: '',
    location: '',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=fef3c7',
  });

  // Step 2: Skills
  const [offeredSkills, setOfferedSkills] = useState([]);
  const [wantedSkills, setWantedSkills] = useState([]);
  const [activeSkillTab, setActiveSkillTab] = useState('OFFERED');

  useEffect(() => {
    if (user?.name) {
      setProfileData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (skillPayload) => {
    if (skillPayload.type === 'OFFERED') {
      if (!offeredSkills.some((s) => s.skillName.toLowerCase() === skillPayload.skillName.toLowerCase())) {
        setOfferedSkills((prev) => [...prev, { ...skillPayload, id: Date.now() + Math.random() }]);
      }
    } else {
      if (!wantedSkills.some((s) => s.skillName.toLowerCase() === skillPayload.skillName.toLowerCase())) {
        setWantedSkills((prev) => [...prev, { ...skillPayload, id: Date.now() + Math.random() }]);
      }
    }
  };

  const handleRemoveSkill = (id, type) => {
    if (type === 'OFFERED') {
      setOfferedSkills((prev) => prev.filter((s) => s.id !== id));
    } else {
      setWantedSkills((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Update personal profile details
      await profileService.updateProfile({
        name: profileData.name.trim(),
        bio: profileData.bio.trim(),
        location: profileData.location.trim(),
        avatarUrl: profileData.avatarUrl,
      });

      // 2. Persist offered and wanted skills
      for (const skill of offeredSkills) {
        await profileService.addSkill({
          skillId: skill.skillId,
          skillName: skill.skillName,
          category: skill.category,
          type: 'OFFERED',
          experience: skill.experience,
        });
      }

      for (const skill of wantedSkills) {
        await profileService.addSkill({
          skillId: skill.skillId,
          skillName: skill.skillName,
          category: skill.category,
          type: 'WANTED',
          experience: null,
        });
      }

      navigate('/dashboard');
    } catch {
      setError('Failed to save profile. You can continue to your dashboard and complete it later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header & Stepper */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <span className="font-display font-bold text-xl text-stone-900 tracking-tight">
              Skill<span className="text-amber-600">Swap</span>
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            Skip for now →
          </Link>
        </div>

        {/* Progress Stepper Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-2">
            <span className={step === 1 ? 'text-amber-600 font-bold' : 'text-stone-700'}>
              1. Profile & Avatar
            </span>
            <span className={step === 2 ? 'text-amber-600 font-bold' : 'text-stone-400'}>
              2. Skills & Goals
            </span>
          </div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full transition-all duration-300 rounded-full"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {error}
          </div>
        )}

        {/* Card Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xl shadow-stone-200/40">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-bold font-display text-stone-900">
                  Introduce yourself to the community
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Help neighbors know who you are and where you&apos;re exchanging from.
                </p>
              </div>

              {/* Avatar Picker */}
              <AvatarPicker
                selectedAvatar={profileData.avatarUrl}
                onSelect={(url) => setProfileData((prev) => ({ ...prev, avatarUrl: url }))}
              />

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    placeholder="Your name"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-stone-800 mb-1.5">
                  City or Neighborhood
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    placeholder="e.g. Austin, TX or Brooklyn, NY"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Short Bio
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="What do you enjoy doing? What drives your curiosity?"
                    className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Skills</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-bold font-display text-stone-900">
                  Select what you can teach and learn
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Add at least 1 skill you can share and 1 skill you want to acquire.
                </p>
              </div>

              {/* Dual Skill Tabs */}
              <div className="flex border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveSkillTab('OFFERED')}
                  className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                    activeSkillTab === 'OFFERED'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Skills I Can Share ({offeredSkills.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSkillTab('WANTED')}
                  className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                    activeSkillTab === 'WANTED'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Skills I Want to Learn ({wantedSkills.length})</span>
                </button>
              </div>

              {/* Active Badges List */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 min-h-[50px] flex flex-wrap gap-2 items-center">
                {activeSkillTab === 'OFFERED' ? (
                  offeredSkills.length > 0 ? (
                    offeredSkills.map((s) => (
                      <SkillBadge
                        key={s.id}
                        userSkill={s}
                        onRemove={(id) => handleRemoveSkill(id, 'OFFERED')}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">No offered skills added yet. Select from below.</span>
                  )
                ) : (
                  wantedSkills.length > 0 ? (
                    wantedSkills.map((s) => (
                      <SkillBadge
                        key={s.id}
                        userSkill={s}
                        onRemove={(id) => handleRemoveSkill(id, 'WANTED')}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">No learning goals added yet. Select from below.</span>
                  )
                )}
              </div>

              {/* Searchable Skill Selector */}
              <SkillSelector
                type={activeSkillTab}
                onSelectSkill={handleAddSkill}
                existingSkillIds={
                  activeSkillTab === 'OFFERED'
                    ? offeredSkills.map((s) => s.skillId).filter(Boolean)
                    : wantedSkills.map((s) => s.skillId).filter(Boolean)
                }
              />

              {/* Step 2 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 text-stone-600 hover:text-stone-900 font-medium text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleComplete}
                  className="py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Saving Profile...</span>
                  ) : (
                    <>
                      <span>Complete & Go to Dashboard</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
