'use client';

import { useState } from 'react';
import { Participant, Present, GameState } from '@/types/game';
import ParticipantSetup from '@/components/ParticipantSetup';
import PresentSetup from '@/components/PresentSetup';
import GamePlay from '@/components/GamePlay';
import GameResults from '@/components/GameResults';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    participants: [],
    presents: [],
    turnOrder: [],
    currentTurnIndex: 0,
    phase: 'setup',
    lastAction: '',
    lastSteal: null,
  });

  const addParticipant = (participant: Participant) => {
    setGameState(prev => ({
      ...prev,
      participants: [...prev.participants, participant],
    }));
  };

  const removeParticipant = (id: string) => {
    setGameState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id),
    }));
  };

  const addPresent = (present: Present) => {
    setGameState(prev => ({
      ...prev,
      presents: [...prev.presents, present],
    }));
  };

  const removePresent = (id: string) => {
    setGameState(prev => ({
      ...prev,
      presents: prev.presents.filter(p => p.id !== id),
    }));
  };

  const startGame = () => {
    // Shuffle participants to create random turn order
    const shuffled = [...gameState.participants]
      .map(p => ({ participant: p, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ participant }) => participant.id);

    setGameState(prev => ({
      ...prev,
      turnOrder: shuffled,
      currentTurnIndex: 0,
      phase: 'playing',
      lastAction: 'Game started! ' + prev.participants.find(p => p.id === shuffled[0])?.name + ' goes first!',
      lastSteal: null,
    }));
  };

  const canStartGame = gameState.participants.length > 0 && 
                        gameState.presents.length > 0 && 
                        gameState.phase === 'setup';

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-red-50 via-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 text-red-600">
          🎅 Secret Santa Game 🎁
        </h1>
        <p className="text-center text-gray-600 mb-8">
          A fun gift exchange game with stealing!
        </p>

        {gameState.phase === 'setup' && (
          <div className="space-y-8">
            <ParticipantSetup
              participants={gameState.participants}
              onAdd={addParticipant}
              onRemove={removeParticipant}
            />

            <PresentSetup
              presents={gameState.presents}
              onAdd={addPresent}
              onRemove={removePresent}
            />

            <div className="text-center">
              <button
                onClick={startGame}
                disabled={!canStartGame}
                className={`px-8 py-4 rounded-lg text-white text-xl font-bold transition-all ${
                  canStartGame
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                🎮 Start Game!
              </button>
              {!canStartGame && (
                <p className="text-red-600 mt-2">
                  Add at least one participant and one present to start
                </p>
              )}
            </div>
          </div>
        )}

        {gameState.phase === 'playing' && (
          <GamePlay
            gameState={gameState}
            setGameState={setGameState}
          />
        )}

        {gameState.phase === 'finished' && (
          <GameResults
            gameState={gameState}
            onReset={() => setGameState({
              participants: [],
              presents: [],
              turnOrder: [],
              currentTurnIndex: 0,
              phase: 'setup',
              lastAction: '',
              lastSteal: null,
            })}
          />
        )}
      </div>
    </main>
  );
}
