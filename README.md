# Northfold Studio — Portfolio Website

A modern, animated portfolio website for **Northfold**, an independent brand and motion studio. Built with Vite, React 18, and React Router v6.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Bundler | [Vite](https://vitejs.dev/) v5 |
| UI | [React](https://react.dev/) 18 |
| Routing | [React Router](https://reactrouter.com/) v6 |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis), driven by the GSAP ticker |
| Animation | [GSAP](https://gsap.com/) 3 + ScrollTrigger + SplitText, via `@gsap/react` (`useGSAP`) |
| WebGL | Hand-written WebGL2 shaders in `src/lib/webgl/` (no 3D library); falls back to plain DOM without WebGL2 |
| Styling | Vanilla CSS (custom properties) + component-scoped `<style>` blocks |
| Fonts | Inter Tight + IBM Plex Mono via Google Fonts |

---

## Motion system

All shared motion lives in [`src/lib/motion.js`](./src/lib/motion.js): plugin registration, the Lenis instance
(`duration: 1.2`, expo easing, synced to `ScrollTrigger.update`), an `introDone` promise that sections wait on until
the preloader lifts, and micro-interactions (`magnetic`, `press`, `revealLines`).

| Section | Effect |
|---|---|
| Preloader | Wordmark rises, 000→100 counter and progress bar, then the curtain lifts (`expo.inOut`) |
| Navbar | `mix-blend-mode: difference`; hides on scroll down, returns on scroll up; fullscreen clip-path menu on mobile |
| Hero | WebGL contour-line field behind the headline (drifts, lifts and glows red around the pointer); masked line reveal, rotating accent word, media frame widens to full bleed on scroll |
| Studio | Statement lights up word by word (scrubbed SplitText), process rules draw in |
| Selected work | Pinned WebGL gallery: scrolling steps through projects (snapped); the active cover is a WebGL stage that noise-dissolves between projects, bends with scroll velocity and ripples under the pointer; a filmstrip of the rest parts around it. Plain vertical list on mobile / reduced motion |
| What we do | Pinned deck: each service card slides over the last, which scales down and dims |
| Clients | Infinite rail that drifts, speeds up and skews with Lenis velocity, and can be dragged with inertia |
| CTA | Image opens from a narrow window to full bleed, then pins while the footer slides over it |
| Footer | Giant wordmark letters rise out of the floor, scrubbed to scroll |

Every effect is wrapped in `gsap.matchMedia()`: the horizontal rail and the pinned deck become plain vertical stacks below
768px, and `prefers-reduced-motion: reduce` disables Lenis and all scroll animation.

---

## Project Structure

```
├── index.html
├── public/
│   ├── projects.json            # Project data (fetched at runtime)
│   ├── images/work/             # Project photography + brand mockups
│   └── videos/                  # Motion clips + poster frames
└── src/
    ├── main.jsx
    ├── App.jsx                  # SmoothScroll + Preloader + Navbar + Cursor + routes
    ├── index.css                # Tokens, reset, shared utilities
    ├── lib/motion.js            # GSAP + Lenis setup and helpers
    ├── components/
    │   ├── SmoothScroll.jsx     # Owns Lenis, resets scroll/triggers on route change
    │   ├── Preloader.jsx
    │   ├── Navbar.jsx
    │   ├── Cursor.jsx           # Pointer follower for [data-cursor] elements
    │   ├── Media.jsx            # Image / in-view video renderer
    │   └── Footer.jsx
    └── pages/
        ├── HomePage.jsx
        ├── CaseStudyPage.jsx
        └── home/
            ├── Hero.jsx
            ├── About.jsx
            ├── Work.jsx
            ├── Services.jsx
            ├── Clients.jsx
            └── Cta.jsx
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `HomePage` | Hero, Work, Studio, Services, Gallery |
| `/case-study/:slug` | `CaseStudyPage` | Per-project detail page |

Valid slugs (from `projects.json`): `halden`, `orbit`, `tidewater`, `mora`, `signal`, `atlas`, `northline`, `parallel`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at **http://localhost:5173** with hot module replacement.

### Production build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

---

## Design System

Tokens live in [`src/index.css`](./src/index.css): `--bg` `#050505`, `--surface` `#121212`, `--muted` `#8a8a8a`,
`--line` `#262626`, `--accent` `#ee3524`, `--sans` Inter Tight, `--mono` IBM Plex Mono, `--pad-x`, `--nav-h`.

---

## Images & motion

Each project in `public/projects.json` has a `media` array: `media[0]` is the cover (work rail and case study hero),
`media[1..3]` fill the case study gallery. Items are `{ "type": "image" | "video", "src", "poster"?, "alt" }` and render
through `<Media>`, which lazy-loads images and only plays videos while they are on screen.

- `public/images/work/` — project photography and brand mockups (WebP, max 1800px)
- `public/videos/` — muted, looping motion clips (H.264, ~10s, under 1.1MB each) with poster frames

Sources and licences for every file are listed in [`CREDITS.md`](./CREDITS.md).

---

## Deployment

The built `dist/` folder is a static site — deploy to any host that serves static files.

### Vercel / Netlify (recommended)

Both platforms auto-detect Vite. Push to GitHub and connect the repo. Set the build command to `npm run build` and the output directory to `dist`.

> **Important:** React Router uses client-side routing. Configure your host to serve `index.html` for all routes so that direct links to `/case-study/halden` work correctly.
>
> - **Netlify:** add a `public/_redirects` file: `/* /index.html 200`
> - **Vercel:** add a `vercel.json` with rewrites to `/index.html`

---

## Origin

This project was migrated from a proprietary design-canvas framework (`x-dc`) with embedded React-like class components and custom template bindings. The React rewrite preserves all original sections, animations, and content while using standard, maintainable tooling.
