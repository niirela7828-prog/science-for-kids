import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { AlbumBySeason, JournalList } from '../components/Records';
import { useProgress } from '../lib/store';

export function AlbumScreen() {
  const p = useProgress();
  const [tab, setTab] = useState<'journal' | 'album'>('journal');
  return (
    <div className="min-h-screen bg-orange-50 pb-12">
      <TopBar title="📔 היומן שלי" back={{ name: 'map' }} />
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 shadow" role="tablist">
          {([
            ['journal', '🧪 יומן ניסויים'],
            ['album', '🍃 אלבום הטבע'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-[52px] rounded-xl text-xl font-bold ${tab === id ? 'bg-orange-500 text-white' : 'text-stone-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'journal' ? <JournalList p={p} /> : <AlbumBySeason p={p} />}
      </main>
    </div>
  );
}
