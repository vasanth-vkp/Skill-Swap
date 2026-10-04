import React, { useState } from 'react';
import { Check, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'avatar-1', name: 'Warm Amber', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=fef3c7' },
  { id: 'avatar-2', name: 'Emerald', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Sam&backgroundColor=d1fae5' },
  { id: 'avatar-3', name: 'Coral Rose', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Maya&backgroundColor=ffe4e6' },
  { id: 'avatar-4', name: 'Indigo Dream', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Jordan&backgroundColor=e0e7ff' },
  { id: 'avatar-5', name: 'Sky Breeze', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Elena&backgroundColor=e0f2fe' },
  { id: 'avatar-6', name: 'Teal Meadow', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Marcus&backgroundColor=ccfbf1' },
  { id: 'avatar-7', name: 'Golden Sunset', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Priya&backgroundColor=ffedd5' },
  { id: 'avatar-8', name: 'Violet Star', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Kai&backgroundColor=f3e8ff' },
];

export default function AvatarPicker({ selectedAvatar, onSelect }) {
  const [useCustomUrl, setUseCustomUrl] = useState(
    Boolean(selectedAvatar && !PRESET_AVATARS.some((p) => p.url === selectedAvatar))
  );
  const [customUrl, setCustomUrl] = useState(
    selectedAvatar && !PRESET_AVATARS.some((p) => p.url === selectedAvatar) ? selectedAvatar : ''
  );

  const handleSelectPreset = (url) => {
    setUseCustomUrl(false);
    onSelect(url);
  };

  const handleCustomUrlChange = (e) => {
    const val = e.target.value;
    setCustomUrl(val);
    onSelect(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-stone-800">
          Choose an Avatar
        </label>
        <button
          type="button"
          onClick={() => setUseCustomUrl(!useCustomUrl)}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          {useCustomUrl ? (
            <>
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Use avatar presets</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Use custom image URL</span>
            </>
          )}
        </button>
      </div>

      {!useCustomUrl ? (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = selectedAvatar === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`relative rounded-2xl p-1 aspect-square flex items-center justify-center transition border-2 cursor-pointer group ${
                  isSelected
                    ? 'border-amber-600 ring-2 ring-amber-500/30 scale-105'
                    : 'border-stone-200 hover:border-amber-300 hover:scale-102'
                }`}
                title={preset.name}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full rounded-xl object-cover bg-stone-50"
                  loading="lazy"
                />
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white rounded-full p-0.5 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center">
            {customUrl ? (
              <img
                src={customUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-stone-400" />
            )}
          </div>
          <input
            type="url"
            value={customUrl}
            onChange={handleCustomUrlChange}
            placeholder="https://example.com/avatar.jpg"
            className="flex-1 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
          />
        </div>
      )}
    </div>
  );
}
