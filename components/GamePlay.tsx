'use client';

import { useState } from 'react';
import { GameState, Present } from '@/types/game';
import ParticipantIcon from './ParticipantIcon';

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

  // Get challengeable presents (maxed out steals)
  const challengeablePresents = gameState.presents.filter(
    p => p.currentOwner !== null && 
         p.currentOwner !== currentPlayerId && 
         p.stolenCount >= 2 &&
         !(gameState.lastSteal && 
           gameState.lastSteal.presentId === p.id && 
           gameState.lastSteal.victim === currentPlayerId)
  );

  const handleChallenge = (presentId: string) => {
    const present = gameState.presents.find(p => p.id === presentId);
    const defenderId = present?.currentOwner;
    
    if (!present || !defenderId || !currentPlayer) return;

    setGameState(prev => ({
      ...prev,
      challengeMode: {
        active: true,
        challenger: currentPlayerId,
        defender: defenderId,
        presentId: presentId,
      },
      lastAction: `⚔️ CHALLENGE! ${currentPlayer.name} is challenging for "${present.name}"!`,
    }));
  };

  const handleChallengeResult = (challengerWon: boolean) => {
    if (!gameState.challengeMode) return;

    const { challenger, defender, presentId } = gameState.challengeMode;
    const present = gameState.presents.find(p => p.id === presentId);
    const challengerPlayer = gameState.participants.find(p => p.id === challenger);
    const defenderPlayer = gameState.participants.find(p => p.id === defender);
    
    if (!present || !challengerPlayer || !defenderPlayer) return;

    if (challengerWon) {
      // Challenger wins - gets the present, defender goes next
      setGameState(prev => {
        const updatedPresents = prev.presents.map(p => {
          if (p.id === presentId) {
            return {
              ...p,
              currentOwner: challenger,
              stolenCount: p.stolenCount + 1,
              stealHistory: [...p.stealHistory, challenger],
            };
          }
          return p;
        });

        const newTurnOrder = [...prev.turnOrder];
        newTurnOrder.splice(prev.currentTurnIndex + 1, 0, defender);

        return {
          ...prev,
          presents: updatedPresents,
          turnOrder: newTurnOrder,
          currentTurnIndex: prev.currentTurnIndex + 1,
          lastAction: `🏆 ${challengerPlayer.name} won the duel and claimed "${present.name}"!`,
          challengeMode: null,
          lastSteal: { thief: challenger, victim: defender, presentId },
        };
      });
    } else {
      // Challenger loses - automatically picks from pile
      const availablePile = gameState.presents.filter(p => p.currentOwner === null);
      
      if (availablePile.length > 0) {
        const randomPresent = availablePile[0]; // Take first available
        
        setGameState(prev => {
          const updatedPresents = prev.presents.map(p => {
            if (p.id === randomPresent.id) {
              return {
                ...p,
                currentOwner: challenger,
                stealHistory: [...p.stealHistory, challenger],
              };
            }
            return p;
          });

          return {
            ...prev,
            presents: updatedPresents,
            currentTurnIndex: prev.currentTurnIndex + 1,
            lastAction: `💔 ${challengerPlayer.name} lost the duel and picked "${randomPresent.name}" from the pile.`,
            challengeMode: null,
            lastSteal: null,
          };
        });
      } else {
        // No presents left in pile, just advance turn
        setGameState(prev => ({
          ...prev,
          currentTurnIndex: prev.currentTurnIndex + 1,
          lastAction: `💔 ${challengerPlayer.name} lost the duel but there are no presents left to pick!`,
          challengeMode: null,
          lastSteal: null,
        }));
      }
    }
  };

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
      {/* Challenge Mode Dialog */}
      {gameState.challengeMode?.active && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-red-900 to-amber-900 p-8 rounded-lg shadow-2xl border-4 border-yellow-500 max-w-2xl w-full mx-4">
            <h2 className="text-4xl font-bold text-yellow-400 text-center mb-6">
              ⚔️ BATTLE MODE ⚔️
            </h2>
            
            <div className="bg-black bg-opacity-50 p-6 rounded-lg mb-6">
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <ParticipantIcon 
                    participant={gameState.participants.find(p => p.id === gameState.challengeMode?.challenger)!} 
                    size="xl" 
                  />
                  <p className="text-white font-bold mt-2 text-xl">
                    {gameState.participants.find(p => p.id === gameState.challengeMode?.challenger)?.name}
                  </p>
                  <p className="text-yellow-400 text-sm">Challenger</p>
                </div>
                
                <div className="text-6xl text-yellow-500">⚡</div>
                
                <div className="text-center">
                  <ParticipantIcon 
                    participant={gameState.participants.find(p => p.id === gameState.challengeMode?.defender)!} 
                    size="xl" 
                  />
                  <p className="text-white font-bold mt-2 text-xl">
                    {gameState.participants.find(p => p.id === gameState.challengeMode?.defender)?.name}
                  </p>
                  <p className="text-yellow-400 text-sm">Defender</p>
                </div>
              </div>
              
              <p className="text-center text-white text-lg mt-4">
                Fighting for: <span className="font-bold text-yellow-400">
                  {gameState.presents.find(p => p.id === gameState.challengeMode?.presentId)?.name}
                </span>
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-white text-center text-lg mb-4 font-semibold">
                Who won the duel?
              </p>
              
              <button
                onClick={() => handleChallengeResult(true)}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xl font-bold border-2 border-green-400"
              >
                🏆 {gameState.participants.find(p => p.id === gameState.challengeMode?.challenger)?.name} Wins!
              </button>
              
              <button
                onClick={() => handleChallengeResult(false)}
                className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xl font-bold border-2 border-red-400"
              >
                💔 {gameState.participants.find(p => p.id === gameState.challengeMode?.defender)?.name} Wins!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Turn Info */}
      <div className="bg-gradient-to-r from-green-700 via-red-700 to-amber-800 rounded-lg shadow-xl p-6 text-center border-4 border-white">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-white">Current Turn:</h2>
          {currentPlayer && <ParticipantIcon participant={currentPlayer} size="lg" />}
          <h2 className="text-3xl font-bold text-white">{currentPlayer?.name}</h2>
        </div>
        <p className="text-white text-lg">
          Turn {gameState.currentTurnIndex + 1} of {gameState.turnOrder.length}
        </p>
      </div>

      {/* Last Action */}
      {gameState.lastAction && (
        <div className={`border-l-4 p-4 rounded border-2 ${
          gameState.lastAction.includes('CHALLENGE') || gameState.lastAction.includes('duel')
            ? 'bg-red-900 border-yellow-500 border-yellow-600'
            : 'bg-white border-green-700 border-green-600'
        }`}>
          <p className={`font-semibold ${
            gameState.lastAction.includes('CHALLENGE') || gameState.lastAction.includes('duel')
              ? 'text-yellow-300'
              : 'text-green-900'
          }`}>{gameState.lastAction}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Pick from Pile */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-green-700">
          <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center gap-2">
            🎁 Pick from Pile
          </h3>
          
          {availablePresents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No presents left in the pile!
            </p>
          ) : (
            <div className="space-y-2">
              {availablePresents.map(present => (
                <button
                  key={present.id}
                  onClick={() => handlePickFromPile(present.id)}
                  className="w-full text-left p-4 bg-amber-50 border-2 border-amber-600 rounded-lg hover:bg-amber-100 hover:border-amber-800 transition-all"
                >
                  <span className="font-semibold text-gray-800">{present.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Steal from Others */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-red-700">
          <h3 className="text-xl font-bold mb-4 text-red-800 flex items-center gap-2">
            🎯 Steal from Others
          </h3>
          
          {stealablePresents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No presents available to steal!
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
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800">{present.name}</span>
                        {owner && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">Owner:</span>
                            <ParticipantIcon participant={owner} size="sm" />
                            <span className="text-sm text-gray-600">{owner.name}</span>
                          </div>
                        )}
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

        {/* Challenge - for maxed out presents */}
        <div className="bg-gradient-to-br from-gray-900 to-red-900 rounded-lg shadow-lg p-6 border-4 border-yellow-500">
          <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
            ⚔️ Challenge Mode
          </h3>
          
          {challengeablePresents.length === 0 ? (
            <p className="text-gray-300 text-center py-8 text-sm">
              No presents at max steals to challenge for yet!
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-300 text-xs mb-2">
                These presents have been stolen twice. Challenge for them!
              </p>
              {challengeablePresents.map(present => {
                const owner = gameState.participants.find(p => p.id === present.currentOwner);
                return (
                  <button
                    key={present.id}
                    onClick={() => handleChallenge(present.id)}
                    className="w-full text-left p-4 bg-red-950 border-2 border-yellow-600 rounded-lg hover:bg-red-900 hover:border-yellow-400 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-semibold text-yellow-300">{present.name}</span>
                        {owner && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">Owner:</span>
                            <ParticipantIcon participant={owner} size="sm" />
                            <span className="text-sm text-gray-300">{owner.name}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">
                        MAX STEALS
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
      <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-amber-800">
        <h3 className="text-xl font-bold mb-4 text-amber-900">📊 Current Status</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.participants.map(participant => {
            const presents = getParticipantPresents(participant.id);
            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 ${
                  participant.id === currentPlayerId
                    ? 'border-red-600 bg-red-50 border-4'
                    : 'border-green-600 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ParticipantIcon participant={participant} size="md" />
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
                              className="flex-1 px-2 py-1 text-xs border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenamePresent(present.id, editingName)}
                              className="px-2 py-1 bg-green-700 text-white rounded text-xs hover:bg-green-800"
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
                              className="px-2 py-1 bg-amber-700 text-white rounded text-xs hover:bg-amber-800"
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
      <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-green-700">
        <h3 className="text-xl font-bold mb-4 text-green-800">📋 Turn Order</h3>
        <div className="flex flex-wrap gap-2">
          {gameState.turnOrder.map((participantId, index) => {
            const participant = gameState.participants.find(p => p.id === participantId);
            const isPast = index < gameState.currentTurnIndex;
            const isCurrent = index === gameState.currentTurnIndex;
            
            return (
              <div
                key={`${participantId}-${index}`}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border-2 ${
                  isCurrent
                    ? 'bg-red-600 text-white border-green-600'
                    : isPast
                    ? 'bg-gray-300 text-gray-600 line-through border-gray-400'
                    : 'bg-green-100 text-green-800 border-green-600'
                }`}
              >
                {participant && <ParticipantIcon participant={participant} size="sm" />}
                <span>{participant?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
