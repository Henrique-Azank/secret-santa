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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        icon: selectedIcon,
      });
      setName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">👥 Participants</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter participant name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex gap-2 items-center">
            <select
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl"
            >
              {AVAILABLE_ICONS.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add
            </button>
          </div>
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
                <span className="text-3xl">{participant.icon}</span>
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
