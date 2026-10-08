import { useEffect, useState } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — ChallengeX` : 'ChallengeX — Challenge Your Idea.';
  }, [title]);
}

/** Reactive media query hook (used for mobile/desktop layout branches). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** True when the user prefers reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
