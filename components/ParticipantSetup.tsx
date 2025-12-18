'use client';

import { useState } from 'react';
import { Participant } from '@/types/game';

const AVAILABLE_ICONS = ['🎅', '🤶', '⛄', '🎄', '🎁', '⭐', '🔔', '🕯️', '🦌', '🧝', '👨', '👩', '👦', '👧', '🧑'];

interface Props {
  participants: Participant[];
  onAdd: (participant: Participant) => void;
  onRemove: (id: string) => void;
}

export default function ParticipantSetup({ participants, onAdd, onRemove }: Props) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [iconType, setIconType] = useState<'emoji' | 'photo'>('emoji');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSource, setPhotoSource] = useState<'upload' | 'url'>('upload');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && (iconType === 'emoji' || photoUrl)) {
      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        icon: selectedIcon,
        iconType,
        photoUrl: iconType === 'photo' ? photoUrl : undefined,
      });
      setName('');
      setPhotoUrl('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">👥 Participants</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter participant name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Icon Type Selector */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="emoji"
                checked={iconType === 'emoji'}
                onChange={(e) => setIconType(e.target.value as 'emoji' | 'photo')}
                className="w-4 h-4"
              />
              <span className="font-semibold text-gray-700">Emoji</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="photo"
                checked={iconType === 'photo'}
                onChange={(e) => setIconType(e.target.value as 'emoji' | 'photo')}
                className="w-4 h-4"
              />
              <span className="font-semibold text-gray-700">Photo</span>
            </label>
          </div>

          {/* Emoji Selector */}
          {iconType === 'emoji' && (
            <select
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl"
            >
              {AVAILABLE_ICONS.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          )}

          {/* Photo Upload or URL */}
          {iconType === 'photo' && (
            <div className="space-y-3">
              {/* Photo Source Toggle */}
              <div className="flex gap-4 border-b border-gray-200 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoSource('upload');
                    setPhotoUrl('');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    photoSource === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📁 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoSource('url');
                    setPhotoUrl('');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    photoSource === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔗 Photo URL
                </button>
              </div>

              {/* File Upload */}
              {photoSource === 'upload' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* URL Input */}
              {photoSource === 'url' && (
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Preview */}
              {photoUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Preview:</span>
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.className = 'hidden';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || (iconType === 'photo' && !photoUrl)}
            className={`w-full px-6 py-2 rounded-lg transition-colors font-semibold ${
              name.trim() && (iconType === 'emoji' || photoUrl)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Participant
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No participants yet. Add your first one!</p>
        ) : (
          participants.map(participant => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {participant.iconType === 'photo' && participant.photoUrl ? (
                  <img 
                    src={participant.photoUrl} 
                    alt={participant.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <span className="text-3xl">{participant.icon}</span>
                )}
                <span className="font-semibold text-gray-800">{participant.name}</span>
              </div>
              <button
                onClick={() => onRemove(participant.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {participants.length > 0 && (
        <p className="text-sm text-gray-600 mt-4">
          Total participants: <strong>{participants.length}</strong>
        </p>
      )}
    </div>
  );
}
