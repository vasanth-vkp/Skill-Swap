import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Check, Sparkles, Award } from 'lucide-react';
import skillService from '../../services/skillService';

const CATEGORIES = [
  'All',
  'Technology',
  'Languages',
  'Arts & Design',
  'Academics',
  'Trades & Practical',
  'Health & Wellness',
];

export default function SkillSelector({ type = 'OFFERED', onSelectSkill, existingSkillIds = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [experience, setExperience] = useState('INTERMEDIATE');

  // Custom skill creation state
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Technology');

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const skills = await skillService.getSkills(
        selectedCategory === 'All' ? null : selectedCategory,
        searchQuery.trim() || null
      );
      setCatalog(skills);
    } catch {
      // Fallback empty catalog on error
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCatalog]);

  const handleSelectPredefined = (skill) => {
    onSelectSkill({
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      type,
      experience: type === 'OFFERED' ? experience : null,
    });
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onSelectSkill({
      skillId: null,
      skillName: customName.trim(),
      category: customCategory,
      type,
      experience: type === 'OFFERED' ? experience : null,
    });

    setCustomName('');
    setIsCreatingCustom(false);
  };

  const hasExactMatch = catalog.some(
    (s) => s.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${type === 'OFFERED' ? 'skills you can teach' : 'skills you want to learn'}...`}
          className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 focus:bg-white transition"
        />
      </div>

      {/* Experience Level Selector (Offered Skills Only per D-303) */}
      {type === 'OFFERED' && (
        <div className="pt-1">
          <span className="block text-xs font-semibold text-stone-700 mb-2">
            Your Experience Level for Added Skills:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'BEGINNER', label: 'Beginner', desc: 'Can help beginners' },
              { id: 'INTERMEDIATE', label: 'Intermediate', desc: 'Solid experience' },
              { id: 'ADVANCED', label: 'Advanced', desc: 'Expert / Pro' },
            ].map((lvl) => {
              const active = experience === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setExperience(lvl.id)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    active
                      ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-500/30'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Award className={`w-3 h-3 ${active ? 'text-amber-600' : 'text-stone-400'}`} />
                    {lvl.label}
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal mt-0.5">{lvl.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Suggestions List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {loading ? (
          <div className="py-6 text-center text-xs text-stone-400">Loading catalog...</div>
        ) : catalog.length > 0 ? (
          catalog.map((skill) => {
            const alreadyAdded = existingSkillIds.includes(skill.id);
            return (
              <div
                key={skill.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 transition group"
              >
                <div>
                  <span className="text-sm font-semibold text-stone-800">{skill.name}</span>
                  <span className="ml-2 text-xs text-stone-400">({skill.category})</span>
                </div>
                <button
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => handleSelectPredefined(skill)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    alreadyAdded
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  }`}
                >
                  {alreadyAdded ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-xs text-stone-500">
            No matching skills in catalog.
          </div>
        )}

        {/* Custom Skill Trigger / Inline Form (D-301) */}
        {searchQuery.trim().length > 1 && !hasExactMatch && !isCreatingCustom && (
          <button
            type="button"
            onClick={() => {
              setCustomName(searchQuery.trim());
              setIsCreatingCustom(true);
            }}
            className="w-full mt-2 py-2.5 px-3 border border-dashed border-amber-300 rounded-xl bg-amber-50/50 hover:bg-amber-50 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Add &quot;{searchQuery.trim()}&quot; as a custom skill</span>
          </button>
        )}

        {/* Custom Skill Creation Form */}
        {isCreatingCustom && (
          <form
            onSubmit={handleCreateCustom}
            className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 mt-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Add Custom Skill</span>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Skill name"
                required
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs transition cursor-pointer"
            >
              Confirm & Add Skill
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
