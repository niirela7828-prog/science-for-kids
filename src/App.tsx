import { useRoute } from './lib/router';
import { useProgress } from './lib/store';
import { isTimeUp } from './lib/progress';
import { useUsageTimer } from './lib/useUsageTimer';
import { MapScreen } from './screens/MapScreen';
import { WorldScreen } from './screens/WorldScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { StickersScreen } from './screens/StickersScreen';
import { AlbumScreen } from './screens/AlbumScreen';
import { CertificateScreen } from './screens/CertificateScreen';
import { ParentsScreen } from './screens/ParentsScreen';
import { TimeUpScreen } from './screens/TimeUpScreen';

export function App() {
  const route = useRoute();
  const p = useProgress();
  const timeUp = isTimeUp(p);
  // Time in the parents area doesn't count toward the child's screen time.
  useUsageTimer(route.name !== 'parents' && !timeUp);

  if (timeUp && route.name !== 'parents') return <TimeUpScreen />;

  switch (route.name) {
    case 'map':
      return <MapScreen />;
    case 'world':
      return <WorldScreen worldId={route.worldId} />;
    case 'activity':
      return <ActivityScreen key={`${route.worldId}/${route.activityId}`} worldId={route.worldId} activityId={route.activityId} />;
    case 'stickers':
      return <StickersScreen />;
    case 'album':
      return <AlbumScreen />;
    case 'certificate':
      return <CertificateScreen worldId={route.worldId} />;
    case 'parents':
      return <ParentsScreen />;
  }
}
