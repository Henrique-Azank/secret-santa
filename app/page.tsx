'use client';

import { useState, useEffect } from 'react';
import { Participant, Present, GameState } from '@/types/game';
import ParticipantSetup from '@/components/ParticipantSetup';
import PresentSetup from '@/components/PresentSetup';
import GamePlay from '@/components/GamePlay';
import GameResults from '@/components/GameResults';

export default function Home() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [santaDelays, setSantaDelays] = useState<number[]>([]);
  const [christmasIcons, setChristmasIcons] = useState<Array<{type: 'emoji' | 'photo', value: string}>>([]);
  const [gameState, setGameState] = useState<GameState>({
    participants: [],
    presents: [],
    turnOrder: [],
    currentTurnIndex: 0,
    phase: 'setup',
    lastAction: '',
    lastSteal: null,
    challengeMode: null,
  });

  useEffect(() => {
    // Array of Christmas-themed emojis
    const availableIcons = ['🎄', '⛄', '🎁', '🔔', '⭐', '🕯️', '🦌', '🎅', '🤶', '🧝', '🍬', '🍭', '🎀', '🧦', '❄️', '☃️'];
    
    // Randomly select 6 icons for the flying elements
    const selectedIcons = Array.from({ length: 6 }, () => ({
      type: 'emoji' as const,
      value: availableIcons[Math.floor(Math.random() * availableIcons.length)]
    }));
    setChristmasIcons(selectedIcons);
    
    // Generate random delays for flying icons on mount
    const delays = Array.from({ length: 6 }, (_, i) => {
      const duration = [20, 22, 18, 28, 24, 26][i];
      return Math.random() * duration;
    });
    setSantaDelays(delays);
  }, []);

  const addParticipant = (participant: Participant) => {
    setGameState(prev => ({
      ...prev,
      participants: [...prev.participants, participant],
    }));
    
    // Add participant icon to flying animations
    const newIcon = {
      type: participant.iconType,
      value: participant.iconType === 'photo' && participant.photoUrl ? participant.photoUrl : participant.icon
    };
    
    setChristmasIcons(prev => [...prev, newIcon]);
    
    // Add a new random delay for the new icon
    const durations = [20, 22, 18, 28, 24, 26];
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];
    setSantaDelays(prev => [...prev, Math.random() * randomDuration]);
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
      challengeMode: null,
    }));
  };

  const canStartGame = gameState.participants.length > 0 && 
                        gameState.presents.length > 0 && 
                        gameState.phase === 'setup';

  return (
    <main className={`min-h-screen p-8 relative transition-colors duration-500 ${
      gameState.challengeMode?.active ? 'bg-black' : ''
    }`} style={gameState.challengeMode?.active ? {background: '#000'} : {}}>
      {/* Background Music - Christmas or Battle */}
      {isMusicPlaying && (
        <iframe
          key={gameState.challengeMode?.active ? 'battle' : 'christmas'}
          width="0"
          height="0"
          src={gameState.challengeMode?.active             
            ? "https://www.youtube.com/embed/EAwWPadFsOA?autoplay=1&loop=1&playlist=EAwWPadFsOA&controls=0&showinfo=0&modestbranding=1"
            : "https://www.youtube.com/embed/mng4p8yWFjs?autoplay=1&loop=1&playlist=mng4p8yWFjs&controls=0&showinfo=0&modestbranding=1"
          }
          title={gameState.challengeMode?.active ? "Battle Music" : "Christmas Background Music"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="hidden"
        ></iframe>
      )}
      
      {/* Music Control Button */}
      <button
        onClick={() => setIsMusicPlaying(!isMusicPlaying)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-red-600 text-2xl"
        title={isMusicPlaying ? "Mute Music" : "Play Music"}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>
      
      {/* Christmas Icons Flying */}
      {santaDelays.length > 0 && christmasIcons.length > 0 && (
        <>
          {christmasIcons.map((icon, index) => {
            const classes = [
              'santa-sleigh',
              'santa-sleigh-reverse', 
              'santa-sleigh-3',
              'santa-sleigh-4',
              'santa-sleigh-5',
              'santa-sleigh-6'
            ];
            const className = classes[index % classes.length];
            
            return (
              <div 
                key={index} 
                className={className} 
                style={{ animationDelay: `-${santaDelays[index]}s` }}
              >
                {icon.type === 'photo' ? (
                  <img 
                    src={icon.value} 
                    alt="Flying icon"
                    className="inline-block w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  icon.value
                )}
              </div>
            );
          })}
        </>
      )}
      
      {/* Snowflakes */}
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold text-center mb-2 text-white drop-shadow-lg">
          🎅 Secret Santa Game 🎁
        </h1>
        <p className="text-center text-white text-lg mb-8 drop-shadow-md">
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
                className={`px-8 py-4 rounded-lg text-white text-xl font-bold transition-all border-4 ${
                  canStartGame
                    ? 'bg-green-700 hover:bg-green-800 shadow-lg hover:shadow-xl border-red-600'
                    : 'bg-gray-400 cursor-not-allowed border-gray-500'
                }`}
              >
                🎮 Start Game!
              </button>
              {!canStartGame && (
                <p className="text-white mt-2">
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
              challengeMode: null,
            })}
          />
        )}
      </div>
    </main>
  );
}
