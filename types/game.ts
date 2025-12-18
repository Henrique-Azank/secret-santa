export interface Participant {
  id: string;
  name: string;
  icon: string;
}

export interface Present {
  id: string;
  name: string;
  currentOwner: string | null;
  stolenCount: number;
  stealHistory: string[]; // participant IDs who have owned this
}

export type GamePhase = 'setup' | 'playing' | 'finished';

export interface GameState {
  participants: Participant[];
  presents: Present[];
  turnOrder: string[]; // participant IDs in order
  currentTurnIndex: number;
  phase: GamePhase;
  lastAction: string;
  lastSteal: { thief: string; victim: string; presentId: string } | null; // Track last steal to prevent immediate steal-back
}
