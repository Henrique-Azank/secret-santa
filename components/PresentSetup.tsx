'use client';

import { useState } from 'react';
import { Present } from '@/types/game';

interface Props {
  presents: Present[];
  onAdd: (present: Present) => void;
  onRemove: (id: string) => void;
}

export default function PresentSetup({ presents, onAdd, onRemove }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        currentOwner: null,
        stolenCount: 0,
        stealHistory: [],
      });
      setName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🎁 Presents</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter present name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Add Present
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {presents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No presents yet. Add your first one!</p>
        ) : (
          presents.map(present => (
            <div
              key={present.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <span className="font-semibold text-gray-800">{present.name}</span>
              </div>
              <button
                onClick={() => onRemove(present.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {presents.length > 0 && (
        <p className="text-sm text-gray-600 mt-4">
          Total presents: <strong>{presents.length}</strong>
        </p>
      )}
    </div>
  );
}
