# Secret Santa Game 🎅🎁

A fun and interactive web application for managing Secret Santa gift exchange games with stealing mechanics!

## Features

### Setup Phase
- **Add Participants**: Register players with custom names and emoji icons
- **Add Presents**: Register gifts that will be exchanged during the game
- **Validation**: Ensures at least one participant and one present before starting

### Game Play
The game follows these rules:

1. **Random Turn Order**: Participants are shuffled at the start to create a random playing order
2. **First Turn**: The first player picks a present from the pile
3. **Subsequent Turns**: Each player can either:
   - Pick a new present from the pile, OR
   - Steal a present from another player (if allowed)
4. **Stealing Rules**:
   - Each present can only be stolen **twice maximum**
   - When a present is stolen, the victim goes next immediately
5. **Game End**: The game ends when all players in the initial random draw have completed their turns

### Game Results
- View final distribution of presents
- See game statistics (total players, presents, turns, steals)
- Identify the most popular (most stolen) present
- Option to start a new game

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React useState (client-side)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
secret-santa/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main game orchestrator
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── ParticipantSetup.tsx # Participant registration UI
│   ├── PresentSetup.tsx     # Present registration UI
│   ├── GamePlay.tsx         # Main game play interface
│   └── GameResults.tsx      # Final results and statistics
├── types/
│   └── game.ts             # TypeScript interfaces for game state
└── package.json
```

## How to Play

1. **Add Participants**: Enter names and select emoji icons for each player
2. **Add Presents**: Enter the names of all the gifts
3. **Start Game**: Click "Start Game" to begin
4. **Take Turns**: 
   - Current player can pick from the pile or steal from others
   - Stolen presents show steal count (max 2 times)
   - Watch the turn order update dynamically
5. **View Results**: See who got what and game statistics

## Game Mechanics Details

- **Turn Queue**: When a steal occurs, the victim is inserted into the turn queue immediately after the current turn
- **Steal Limit**: Presents stolen twice become "locked" and can't be stolen again
- **Visual Feedback**: Color-coded UI shows current player, available actions, and game progress
- **Real-time Updates**: Game state updates immediately with each action

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

## Author

Built with ❤️ for fun Secret Santa exchanges!
