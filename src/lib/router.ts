import { useEffect, useState } from 'react';

// Hash routing (#/world/lab) works on GitHub Pages and offline without server setup.
export type Route =
  | { name: 'map' }
  | { name: 'world'; worldId: string }
  | { name: 'activity'; worldId: string; activityId: string }
  | { name: 'stickers' }
  | { name: 'album' }
  | { name: 'certificate'; worldId: string }
  | { name: 'parents' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case 'world':
      if (parts[1] && parts[2]) return { name: 'activity', worldId: parts[1], activityId: parts[2] };
      if (parts[1]) return { name: 'world', worldId: parts[1] };
      break;
    case 'stickers':
      return { name: 'stickers' };
    case 'album':
      return { name: 'album' };
    case 'certificate':
      if (parts[1]) return { name: 'certificate', worldId: parts[1] };
      break;
    case 'parents':
      return { name: 'parents' };
  }
  return { name: 'map' };
}

export function routeToHash(r: Route): string {
  switch (r.name) {
    case 'map':
      return '#/';
    case 'world':
      return `#/world/${r.worldId}`;
    case 'activity':
      return `#/world/${r.worldId}/${r.activityId}`;
    case 'certificate':
      return `#/certificate/${r.worldId}`;
    default:
      return `#/${r.name}`;
  }
}

export function navigate(r: Route) {
  window.location.hash = routeToHash(r);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
