'use client';

import { GameState } from '@/types/game';
import ParticipantIcon from './ParticipantIcon';

interface Props {
  gameState: GameState;
  onReset: () => void;
}

export default function GameResults({ gameState, onReset }: Props) {
  const participantsWithPresents = gameState.participants.map(participant => {
    const presents = gameState.presents.filter(p => p.currentOwner === participant.id);
    return { participant, presents };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-red-700 to-amber-800 rounded-lg shadow-xl p-8 text-center border-4 border-white">
        <h2 className="text-4xl font-bold text-white mb-2">
          🎉 Game Complete! 🎉
        </h2>
        <p className="text-white text-lg">
          Here's who got what!
        </p>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-green-700">
        <h3 className="text-2xl font-bold mb-6 text-green-800">Final Distribution</h3>
        
        <div className="space-y-4">
          {participantsWithPresents.map(({ participant, presents }) => (
            <div
              key={participant.id}
              className="p-6 bg-gradient-to-r from-green-50 to-red-50 rounded-lg border-4 border-amber-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <ParticipantIcon participant={participant} size="xl" />
                <h4 className="text-2xl font-bold text-gray-800">{participant.name}</h4>
              </div>
              
              {presents.length > 0 ? (
                <div className="space-y-2 ml-12">
                  {presents.map(present => (
                    <div key={present.id} className="flex items-start gap-2">
                      <span className="text-2xl">🎁</span>
                      <div>
                        <p className="font-semibold text-gray-800">{present.name}</p>
                        <p className="text-sm text-gray-600">
                          Stolen {present.stolenCount} time{present.stolenCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 ml-12">Didn't get any presents 😢</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-red-700">
        <h3 className="text-2xl font-bold mb-4 text-red-800">📊 Game Statistics</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-600">
            <p className="text-sm text-gray-600">Total Players</p>
            <p className="text-3xl font-bold text-green-700">{gameState.participants.length}</p>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-600">
            <p className="text-sm text-gray-600">Total Presents</p>
            <p className="text-3xl font-bold text-red-700">{gameState.presents.length}</p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-700">
            <p className="text-sm text-gray-600">Total Turns</p>
            <p className="text-3xl font-bold text-amber-800">{gameState.turnOrder.length}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-600">
            <p className="text-sm text-gray-600">Total Steals</p>
            <p className="text-3xl font-bold text-green-700">
              {gameState.presents.reduce((sum, p) => sum + p.stolenCount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Most Stolen Present */}
      {(() => {
        const mostStolen = gameState.presents.reduce((max, p) => 
          p.stolenCount > max.stolenCount ? p : max
        , gameState.presents[0]);
        
        if (mostStolen && mostStolen.stolenCount > 0) {
          return (
            <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border-4 border-red-600 p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-800">🔥 Most Popular Present</h3>
              <p className="text-lg">
                <span className="font-bold">"{mostStolen.name}"</span> was stolen{' '}
                <span className="font-bold text-red-600">{mostStolen.stolenCount}</span> time
                {mostStolen.stolenCount !== 1 ? 's' : ''}!
              </p>
            </div>
          );
        }
      })()}

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors text-xl font-bold shadow-lg hover:shadow-xl border-4 border-green-700"
        >
          🔄 Start New Game
        </button>
      </div>
    </div>
  );
}
