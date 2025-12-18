'use client';

import { useState } from 'react';
import { GameState, Present } from '@/types/game';

interface Props {
  gameState: GameState;
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
}

export default function GamePlay({ gameState, setGameState }: Props) {
  const [editingPresentId, setEditingPresentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const currentPlayerId = gameState.turnOrder[gameState.currentTurnIndex];
  const currentPlayer = gameState.participants.find(p => p.id === currentPlayerId);
  
  // Check if all participants have had their initial turn
  const isGameComplete = gameState.currentTurnIndex >= gameState.turnOrder.length;

  if (isGameComplete && gameState.phase === 'playing') {
    setGameState(prev => ({ ...prev, phase: 'finished' }));
    return null;
  }

  // Get available presents (those still in the pile)
  const availablePresents = gameState.presents.filter(p => p.currentOwner === null);
  
  // Get stealable presents (those owned by others and stolen < 2 times)
  // Also prevent immediate steal-back: if player A just stole from player B, player B cannot steal it back immediately
  const stealablePresents = gameState.presents.filter(
    p => p.currentOwner !== null && 
         p.currentOwner !== currentPlayerId && 
         p.stolenCount < 2 &&
         // Prevent immediate steal-back
         !(gameState.lastSteal && 
           gameState.lastSteal.presentId === p.id && 
           gameState.lastSteal.victim === currentPlayerId)
  );

  const handlePickFromPile = (presentId: string) => {
    const present = gameState.presents.find(p => p.id === presentId);
    if (!present || !currentPlayer) return;

    setGameState(prev => {
      const updatedPresents = prev.presents.map(p => {
        if (p.id === presentId) {
          return {
            ...p,
            currentOwner: currentPlayerId,
            stealHistory: [...p.stealHistory, currentPlayerId],
          };
        }
        return p;
      });

      return {
        ...prev,
        presents: updatedPresents,
        currentTurnIndex: prev.currentTurnIndex + 1,
        lastAction: `${currentPlayer.icon} ${currentPlayer.name} picked "${present.name}" from the pile!`,
        lastSteal: null, // Clear last steal when picking from pile
      };
    });
  };

  const handleSteal = (presentId: string) => {
    const present = gameState.presents.find(p => p.id === presentId);
    const victimId = present?.currentOwner;
    const victim = gameState.participants.find(p => p.id === victimId);
    
    if (!present || !victim || !currentPlayer) return;

    setGameState(prev => {
      const updatedPresents = prev.presents.map(p => {
        if (p.id === presentId) {
          return {
            ...p,
            currentOwner: currentPlayerId,
            stolenCount: p.stolenCount + 1,
            stealHistory: [...p.stealHistory, currentPlayerId],
          };
        }
        return p;
      });

      // Insert victim's ID right after current position (they go next)
      const newTurnOrder = [...prev.turnOrder];
      newTurnOrder.splice(prev.currentTurnIndex + 1, 0, victimId!);

      return {
        ...prev,
        presents: updatedPresents,
        turnOrder: newTurnOrder,
        currentTurnIndex: prev.currentTurnIndex + 1,
        lastAction: `${currentPlayer.icon} ${currentPlayer.name} stole "${present.name}" from ${victim.icon} ${victim.name}!`,
        lastSteal: { thief: currentPlayerId, victim: victimId!, presentId }, // Track this steal
      };
    });
  };

  const getParticipantPresents = (participantId: string) => {
    return gameState.presents.filter(p => p.currentOwner === participantId);
  };

  const handleRenamePresent = (presentId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setGameState(prev => ({
      ...prev,
      presents: prev.presents.map(p => 
        p.id === presentId ? { ...p, name: newName.trim() } : p
      ),
    }));
    setEditingPresentId(null);
    setEditingName('');
  };

  const startEditing = (presentId: string, currentName: string) => {
    setEditingPresentId(presentId);
    setEditingName(currentName);
  };

  return (
    <div className="space-y-6">
      {/* Current Turn Info */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-xl p-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Current Turn: {currentPlayer?.icon} {currentPlayer?.name}
        </h2>
        <p className="text-white text-lg">
          Turn {gameState.currentTurnIndex + 1} of {gameState.turnOrder.length}
        </p>
      </div>

      {/* Last Action */}
      {gameState.lastAction && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-800 font-semibold">{gameState.lastAction}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pick from Pile */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            🎁 Pick from Pile
          </h3>
          
          {availablePresents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No presents left in the pile! You must steal.
            </p>
          ) : (
            <div className="space-y-2">
              {availablePresents.map(present => (
                <button
                  key={present.id}
                  onClick={() => handlePickFromPile(present.id)}
                  className="w-full text-left p-4 bg-green-50 border-2 border-green-300 rounded-lg hover:bg-green-100 hover:border-green-500 transition-all"
                >
                  <span className="font-semibold text-gray-800">{present.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Steal from Others */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            🎯 Steal from Others
          </h3>
          
          {stealablePresents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No presents available to steal yet!
            </p>
          ) : (
            <div className="space-y-2">
              {stealablePresents.map(present => {
                const owner = gameState.participants.find(p => p.id === present.currentOwner);
                return (
                  <button
                    key={present.id}
                    onClick={() => handleSteal(present.id)}
                    className="w-full text-left p-4 bg-red-50 border-2 border-red-300 rounded-lg hover:bg-red-100 hover:border-red-500 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-gray-800">{present.name}</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Owner: {owner?.icon} {owner?.name}
                        </p>
                      </div>
                      <span className="text-xs bg-orange-200 px-2 py-1 rounded">
                        Stolen: {present.stolenCount}/2
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Current Status</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.participants.map(participant => {
            const presents = getParticipantPresents(participant.id);
            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 ${
                  participant.id === currentPlayerId
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{participant.icon}</span>
                  <span className="font-semibold">{participant.name}</span>
                </div>
                {presents.length > 0 ? (
                  <div className="text-sm space-y-2">
                    {presents.map(present => (
                      <div key={present.id} className="text-gray-700 flex items-center gap-1">
                        <span>🎁</span>
                        {editingPresentId === present.id ? (
                          <div className="flex-1 flex gap-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenamePresent(present.id, editingName);
                                } else if (e.key === 'Escape') {
                                  setEditingPresentId(null);
                                  setEditingName('');
                                }
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenamePresent(present.id, editingName)}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingPresentId(null);
                                setEditingName('');
                              }}
                              className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1">{present.name}</span>
                            <button
                              onClick={() => startEditing(present.id, present.name)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              title="Rename present"
                            >
                              ✎
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No presents yet</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn Order */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">📋 Turn Order</h3>
        <div className="flex flex-wrap gap-2">
          {gameState.turnOrder.map((participantId, index) => {
            const participant = gameState.participants.find(p => p.id === participantId);
            const isPast = index < gameState.currentTurnIndex;
            const isCurrent = index === gameState.currentTurnIndex;
            
            return (
              <div
                key={`${participantId}-${index}`}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  isCurrent
                    ? 'bg-yellow-400 text-white'
                    : isPast
                    ? 'bg-gray-300 text-gray-600 line-through'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {participant?.icon} {participant?.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
