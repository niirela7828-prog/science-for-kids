import type { Game } from '../content';
import { TapGameView } from './TapGame';
import { BreathGameView } from './BreathGame';
import { OrderGameView } from './OrderGame';
import { MemoryGameView } from './MemoryGame';
import { SortGameView } from './SortGame';
import { FindGameView } from './FindGame';
import { JumpGameView } from './JumpGame';
import { SpeakButton } from '../components/Speak';

/** Renders any mini-game described in the content files. */
export function GameView({ game, onDone }: { game: Game; onDone: () => void }) {
  return (
    <div className="space-y-4" data-testid={`game-${game.type}`}>
      <p className="text-xl font-semibold leading-relaxed">
        {game.prompt} <SpeakButton text={game.prompt} small />
      </p>
      {(() => {
        switch (game.type) {
          case 'tap':
            return <TapGameView game={game} onDone={onDone} />;
          case 'breath':
            return <BreathGameView game={game} onDone={onDone} />;
          case 'order':
            return <OrderGameView game={game} onDone={onDone} />;
          case 'memory':
            return <MemoryGameView game={game} onDone={onDone} />;
          case 'sort':
            return <SortGameView game={game} onDone={onDone} />;
          case 'find':
            return <FindGameView game={game} onDone={onDone} />;
          case 'jump':
            return <JumpGameView game={game} onDone={onDone} />;
        }
      })()}
    </div>
  );
}

export function DoneNote({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-green-50 p-3 text-center text-xl font-semibold text-green-800 ring-2 ring-green-400 animate-pop" role="status">
      🎉 {text} <SpeakButton text={text} small />
    </div>
  );
}

export function GentleNote({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-3 text-center text-lg text-amber-900 ring-2 ring-amber-300 animate-fadein" role="status">
      {text}
    </div>
  );
}
