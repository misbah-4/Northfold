import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startLenis, stopLenis, getLenis, ScrollTrigger, scrollTo } from '../lib/motion.js';

/** Owns the Lenis instance and resets scroll + triggers on route change. */
export default function SmoothScroll({ children }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    startLenis();
    return () => stopLenis();
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    // Let the new page mount its triggers, then measure.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (hash) setTimeout(() => scrollTo(hash), 120);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fonts change line lengths; re-measure once they land.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return children;
}
