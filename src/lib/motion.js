import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const EASE_OUT = 'expo.out';
export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Lenis smooth scroll, driven by the GSAP ticker ─────────────── */
let lenis = null;

export function startLenis() {
  if (lenis || reducedMotion()) return lenis;
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function raf(time) {
  lenis?.raf(time * 1000);
}

export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
}

export const getLenis = () => lenis;

/* Scroll to an element, selector or y value, with or without Lenis. */
export function scrollTo(target, opts = {}) {
  if (lenis) return lenis.scrollTo(target, { offset: 0, ...opts });
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (typeof el === 'number') window.scrollTo({ top: el, behavior: opts.immediate ? 'auto' : 'smooth' });
  else el?.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
}

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/* ── Intro gate: sections wait for the preloader before animating in ── */
let introResolve;
export const introDone = new Promise(r => { introResolve = r; });
export const finishIntro = () => introResolve?.();

/* ── Micro-interactions ─────────────────────────────────────────── */

/** Element drifts toward the pointer while hovered. */
export function magnetic(el, { strength = 0.3, duration = 0.5 } = {}) {
  if (!el || reducedMotion() || matchMedia('(hover: none)').matches) return () => {};
  const xTo = gsap.quickTo(el, 'x', { duration, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration, ease: 'power3.out' });
  const move = e => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { xTo(0); yTo(0); };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
    gsap.set(el, { clearProps: 'x,y' });
  };
}

/** Squash on press, elastic release. */
export function press(el, { scale = 0.94 } = {}) {
  if (!el || reducedMotion()) return () => {};
  const down = () => gsap.to(el, { scale, duration: 0.12, ease: 'power2.in', overwrite: 'auto' });
  const up = () => gsap.to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointerleave', up);
  };
}

/** Split an element into masked lines and slide them up. Returns the tween. */
export function revealLines(el, { delay = 0, stagger = 0.08, duration = 1.2, scrollTrigger } = {}) {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
  return gsap.from(split.lines, {
    yPercent: 110,
    duration,
    delay,
    stagger,
    ease: EASE_OUT,
    scrollTrigger,
  });
}
