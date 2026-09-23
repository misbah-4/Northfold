# Northfold Studio — Portfolio Website

A modern, animated portfolio website for **Northfold**, an independent brand and motion studio. Built with Vite, React 18, and React Router v6.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Bundler | [Vite](https://vitejs.dev/) v5 |
| UI | [React](https://react.dev/) 18 |
| Routing | [React Router](https://reactrouter.com/) v6 |
| Styling | Vanilla CSS (CSS custom properties) |
| Animations | Web Animations API + CSS transitions |
| Fonts | [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts |

No UI framework, no Tailwind — just CSS tokens and hand-crafted components.

---

## Project Structure

```
├── index.html                  # Root HTML shell
├── package.json
├── vite.config.js
├── .gitignore
├── public/
│   └── projects.json           # Project data (fetched at runtime)
└── src/
    ├── main.jsx                # React root + BrowserRouter
    ├── App.jsx                 # Route definitions
    ├── index.css               # Global reset, CSS tokens, utilities
    ├── components/
    │   ├── Navbar.jsx          # Sticky responsive nav + mobile menu
    │   ├── Footer.jsx          # Dark footer bar
    │   └── ImageSlot.jsx       # Image placeholder component
    └── pages/
        ├── HomePage.jsx        # Home page (fetches projects, assembles sections)
        ├── CaseStudyPage.jsx   # Case study detail, driven by URL slug
        └── home/
            ├── HeroSection.jsx     # Animated headline + rotating accent word
            ├── WorkSection.jsx     # Filter tabs + hover-overlay project grid
            ├── StudioSection.jsx   # About copy + numbered process steps
            ├── ServicesSection.jsx # Hover-invert service rows
            └── GallerySection.jsx  # Scroll strip, image reveals, marquee
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

All colours, spacing and typography are defined as CSS custom properties in [`src/index.css`](./src/index.css):

| Token | Value | Role |
|---|---|---|
| `--accent` | `#ee3524` | Red accent — borders, highlights, CTA hover |
| `--black` | `#0b0b0b` | Near-black — body text, dark backgrounds |
| `--white` | `#ffffff` | Page background |
| `--muted` | `#5e5e5e` | Secondary text |
| `--border` | `#e3e3e0` | Light dividers |
| `--mono` | IBM Plex Mono | Monospaced labels, tags, captions |
| `--pad-x` | `clamp(20px, 4vw, 56px)` | Responsive horizontal padding |
| `--max-w` | `1600px` | Maximum content width |

---

## Adding Real Images

Image slots are currently rendered as styled placeholders via `<ImageSlot>`. To swap in a real image, replace the `<ImageSlot>` call in the relevant section component with a standard `<img>`:

```jsx
// Before
<ImageSlot label="Cover — Halden Roasters" />

// After
<img
  src="/images/halden-cover.jpg"
  alt="Halden Roasters — brand cover"
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

Place images in the `public/images/` folder so Vite serves them as static assets.

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
