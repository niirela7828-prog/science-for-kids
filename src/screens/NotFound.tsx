import { Companion } from '../components/Companion';
import { BigButton } from '../components/ui';
import { navigate } from '../lib/router';

export function NotFound() {
  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <Companion text="אופס, הלכנו לאיבוד! בואי נחזור למפה." mood="think" />
      <BigButton className="w-full" onClick={() => navigate({ name: 'map' })}>
        🗺️ למפה
      </BigButton>
    </main>
  );
}
