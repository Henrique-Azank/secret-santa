'use client';

import { GameState } from '@/types/game';

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
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-xl p-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-2">
          🎉 Game Complete! 🎉
        </h2>
        <p className="text-white text-lg">
          Here's who got what!
        </p>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Final Distribution</h3>
        
        <div className="space-y-4">
          {participantsWithPresents.map(({ participant, presents }) => (
            <div
              key={participant.id}
              className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-purple-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{participant.icon}</span>
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">📊 Game Statistics</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Players</p>
            <p className="text-3xl font-bold text-blue-600">{gameState.participants.length}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Presents</p>
            <p className="text-3xl font-bold text-green-600">{gameState.presents.length}</p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Turns</p>
            <p className="text-3xl font-bold text-orange-600">{gameState.turnOrder.length}</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Steals</p>
            <p className="text-3xl font-bold text-purple-600">
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
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-300 p-6">
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
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xl font-bold shadow-lg hover:shadow-xl"
        >
          🔄 Start New Game
        </button>
      </div>
    </div>
  );
}
