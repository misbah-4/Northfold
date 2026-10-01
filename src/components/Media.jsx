import { useEffect, useRef } from 'react';

/**
 * Image or looping video. Videos are muted, inline, and only play while
 * on screen so a page full of clips doesn't decode them all at once.
 */
export default function Media({ item, className = '', eager = false, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || item?.type !== 'video') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { rootMargin: '200px 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, [item?.type, item?.src]);

  if (!item) return null;
  const cls = `media ${className}`;

  if (item.type === 'video') {
    return (
      <video
        ref={ref}
        className={cls}
        style={style}
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        aria-label={item.alt}
      />
    );
  }
  return (
    <img
      className={cls}
      style={style}
      src={item.src}
      alt={item.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
