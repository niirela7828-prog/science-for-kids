import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { QuestionCard } from '../components/QuestionCard';
import { FindGameView } from '../games/FindGame';
import { SortGameView } from '../games/SortGame';
import { OrderGameView } from '../games/OrderGame';
import { App } from '../App';
import { getProgress, setProgress } from '../lib/store';
import { addUsage, defaultProgress } from '../lib/progress';
import type { Question } from '../content';

const q: Question = {
  text: 'כמה רגליים לחרק?',
  options: [
    { id: 'a', text: 'ארבע' },
    { id: 'b', text: 'שש' },
    { id: 'c', text: 'שמונה' },
  ],
  correct: 'b',
  hint: 'שלוש בכל צד',
  explanation: 'לחרק יש שש רגליים',
};

function go(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  localStorage.clear();
  setProgress(defaultProgress());
  window.location.hash = '#/';
});

describe('QuestionCard', () => {
  it('gives a hint after the first mistake, and an explanation after the second', () => {
    const onDone = vi.fn();
    render(<QuestionCard q={q} onDone={onDone} />);
    fireEvent.click(screen.getByText('ארבע'));
    expect(screen.getByRole('status')).toHaveTextContent('שלוש בכל צד');
    expect(screen.queryByText('ממשיכים ⬅')).toBeNull();
    fireEvent.click(screen.getByText('שמונה'));
    expect(screen.getByRole('status')).toHaveTextContent('לחרק יש שש רגליים');
    fireEvent.click(screen.getByText('ממשיכים ⬅'));
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('a right answer praises and explains', () => {
    const onDone = vi.fn();
    render(<QuestionCard q={q} onDone={onDone} />);
    fireEvent.click(screen.getByText('שש'));
    expect(screen.getByRole('status')).toHaveTextContent('לחרק יש שש רגליים');
    fireEvent.click(screen.getByText('ממשיכים ⬅'));
    expect(onDone).toHaveBeenCalledOnce();
  });
});

describe('mini games', () => {
  it('find game: wrong tap gives a gentle note, finding all finishes', () => {
    const onDone = vi.fn();
    render(
      <FindGameView
        game={{
          type: 'find',
          prompt: '',
          doneText: 'יופי',
          items: [
            { id: 'sun', text: 'שמש', emoji: '☀️', correct: true },
            { id: 'moon', text: 'ירח', emoji: '🌙', correct: false },
            { id: 'fire', text: 'אש', emoji: '🔥', correct: true },
          ],
        }}
        onDone={onDone}
      />,
    );
    fireEvent.click(screen.getByText('ירח'));
    expect(screen.getByRole('status')).toHaveTextContent('לא מתאים');
    fireEvent.click(screen.getByText('שמש'));
    fireEvent.click(screen.getByText('אש'));
    expect(onDone).toHaveBeenCalled();
  });

  it('sort game', () => {
    const onDone = vi.fn();
    render(
      <SortGameView
        game={{
          type: 'sort',
          prompt: '',
          doneText: 'יופי',
          bins: [
            { id: 'alive', text: 'חי' },
            { id: 'not', text: 'לא חי' },
          ],
          items: [
            { id: 'tree', text: 'עץ', emoji: '🌳', bin: 'alive' },
            { id: 'rock', text: 'אבן', emoji: '🪨', bin: 'not' },
          ],
        }}
        onDone={onDone}
      />,
    );
    for (let i = 0; i < 2; i++) {
      const isTree = screen.queryByText('עץ') !== null;
      fireEvent.click(screen.getByText(isTree ? 'לא חי' : 'חי')); // wrong first
      expect(screen.getByRole('status')).toBeInTheDocument();
      fireEvent.click(screen.getByText(isTree ? 'חי' : 'לא חי'));
    }
    expect(onDone).toHaveBeenCalled();
  });

  it('order game: wrong order is gentle, right order finishes', () => {
    const onDone = vi.fn();
    render(
      <OrderGameView
        game={{
          type: 'order',
          prompt: '',
          doneText: 'יופי',
          items: [
            { id: '1', text: 'פה' },
            { id: '2', text: 'ושט' },
            { id: '3', text: 'קיבה' },
          ],
        }}
        onDone={onDone}
      />,
    );
    fireEvent.click(screen.getByText('קיבה'));
    expect(screen.getByRole('status')).toHaveTextContent('נסי שוב');
    fireEvent.click(screen.getByText('פה'));
    fireEvent.click(screen.getByText('ושט'));
    fireEvent.click(screen.getByText('קיבה'));
    expect(onDone).toHaveBeenCalled();
  });
});

describe('app', () => {
  it('shows the map with the 5 worlds', () => {
    render(<App />);
    for (const t of ['מעבדה בבית', 'המסע בגוף', 'בלשית הטבע', 'מה קורה אם…?', 'מסע בחלל']) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });

  it('body world: only the first organ is open', () => {
    render(<App />);
    go('#/world/body');
    const buttons = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-label')?.includes('נעול'));
    expect(buttons.length).toBe(8);
    expect(screen.getByRole('button', { name: 'הפה והשיניים' })).toBeEnabled();
  });

  it('marks adult experiments in the lab', () => {
    render(<App />);
    go('#/world/lab');
    expect(screen.getAllByText('🧑‍🔬 עם מבוגר').length).toBeGreaterThanOrEqual(3);
  });

  it('plays a whole experiment and earns a sticker + journal entry', () => {
    render(<App />);
    go('#/world/lab/pepper');
    const next = () => fireEvent.click(screen.getByRole('button', { name: /מתחילים|הלאה|הכול מוכן|סיימתי את הניסוי/ }));
    next(); // intro → materials
    next(); // materials → predict
    expect(screen.getByRole('button', { name: /הלאה/ })).toBeDisabled();
    fireEvent.click(screen.getByText('הפלפל יברח לצדדים'));
    next(); // → steps
    while (screen.queryByText('עשיתי! ✔')) fireEvent.click(screen.getByText('עשיתי! ✔'));
    next(); // → result
    expect(screen.getByText(/הניחוש שלך היה/)).toBeInTheDocument();
    next(); // → why
    next(); // → question
    const question = screen.getByTestId('question');
    fireEvent.click(within(question).getByText('החליש את ה"עור" שעל פני המים'));
    fireEvent.click(screen.getByText('ממשיכים ⬅'));
    fireEvent.click(screen.getByRole('button', { name: /סיום בלי תמונה/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('פלפל מהיר');
    const p = getProgress();
    expect(p.stickers).toContain('lab/pepper');
    expect(p.journal[0]).toMatchObject({ activityId: 'pepper', prediction: 'הפלפל יברח לצדדים' });
  });

  it('a nature mission adds a found item to the season album', () => {
    render(<App />);
    go('#/world/nature/birds');
    fireEvent.click(screen.getByRole('button', { name: /יוצאת החוצה/ }));
    fireEvent.click(screen.getByRole('button', { name: /חזרתי/ }));
    expect(screen.getByRole('button', { name: /לשאלת הבלשית/ })).toBeDisabled();
    fireEvent.click(screen.getByText('שרה'));
    fireEvent.click(screen.getByRole('button', { name: /לשאלת הבלשית/ }));
    fireEvent.click(screen.getByText('כנפיים')); // wrong → hint
    fireEvent.click(screen.getByText('נוצות'));
    fireEvent.click(screen.getByText('ממשיכים ⬅'));
    const p = getProgress();
    expect(p.album).toHaveLength(1);
    expect(p.album[0].found).toEqual(['sing']);
    expect(p.album[0].season).toMatch(/winter|spring|summer|autumn/);
  });

  it('parents area needs the math answer', () => {
    render(<App />);
    go('#/parents');
    const qText = screen.getByTestId('gate-question').textContent!;
    const [a, b] = qText.match(/\d+/g)!.map(Number);
    const input = screen.getByLabelText('תשובה');
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'כניסה' }));
    expect(screen.getByText(/לא נכון/)).toBeInTheDocument();
    const q2 = screen.getByTestId('gate-question').textContent!;
    const [c, d] = q2.match(/\d+/g)!.map(Number);
    fireEvent.change(screen.getByLabelText('תשובה'), { target: { value: String(c * d) } });
    fireEvent.click(screen.getByRole('button', { name: 'כניסה' }));
    expect(screen.getByText('📊 התקדמות')).toBeInTheDocument();
    expect(a * b).toBeGreaterThan(0);
    // set the time limit and reset
    fireEvent.click(screen.getByRole('button', { name: '30 דק׳' }));
    expect(getProgress().settings.dailyLimitMin).toBe(30);
  });

  it('when the daily time is over, a friendly "go explore" screen appears', () => {
    setProgress((p) => addUsage(p, 21 * 60));
    render(<App />);
    expect(screen.getByText(/זמן המסך להיום נגמר/)).toBeInTheDocument();
  });
});
