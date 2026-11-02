<div align="center">

  <a href="https://github.com/Sahilmd01/Listenify">
    <img src="public/icon.svg" alt="Listenify Logo" width="100" height="100" />
  </a>

  # Listenify

  ### 🎵 Modern Open-Source Music Streaming Platform

  **Next-generation music streaming web app built with Next.js 16, React 19, TypeScript, and a custom design system.**

  <p>
    <a href="https://github.com/Sahilmd01/Listenify/stargazers"><img src="https://img.shields.io/github/stars/Sahilmd01/Listenify?style=for-the-badge&logo=star&color=FFD700" alt="GitHub Stars" /></a>
    <a href="https://github.com/Sahilmd01/Listenify/network/members"><img src="https://img.shields.io/github/forks/Sahilmd01/Listenify?style=for-the-badge&logo=git&color=8A2BE2" alt="GitHub Forks" /></a>
    <a href="https://github.com/Sahilmd01/Listenify/issues"><img src="https://img.shields.io/github/issues/Sahilmd01/Listenify?style=for-the-badge&color=brightgreen" alt="Issues" /></a>
    <a href="https://github.com/Sahilmd01/Listenify/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License: MIT" /></a>
  </p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://github.com/pmndrs/zustand"><img src="https://img.shields.io/badge/State-Zustand-orange?style=flat-square" alt="Zustand" /></a>
    <a href="#-contributing"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>

  <p>
    <a href="#-features">Key Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture--project-structure">Project Structure</a> •
    <a href="#-contributing">Contributing</a> •
    <a href="#-roadmap">Roadmap</a> •
    <a href="#-license">License</a>
  </p>

</div>

---

## 📖 Overview

**Listenify** is an open-source, community-driven music streaming web application designed to deliver an elegant, fast, and responsive user experience. Engineered with React 19 and Next.js 16 (App Router), it emphasizes pure performance, zero-runtime CSS overhead, fluid micro-interactions, and complete visual customization through dual-mode tokens.

Whether you're looking to explore modern frontend audio engineering, integrate music APIs, or build community-driven audio tools, Listenify provides an extensible, production-ready foundation.

---

## 🌟 Highlights & Features

- **🎧 Seamless Music Player**: Persistent interactive player bar with play/pause, scrubbable progress bar, waveform visualizations, volume control, track queues, and repeat/shuffle logic.
- **🌗 Instant Dual-Theme Engine**: Zero-flash dark and light mode switching synced with system preferences and persisted in `localStorage`.
- **⚡ Next.js App Router & React 19**: Server components by default with client components only where state and audio interactivity require them.
- **🎨 Custom Tokenized Design System**: Modular UI built with Vanilla CSS variables and design tokens—ultra lightweight with zero CSS-in-JS overhead.
- **📱 Fully Responsive**: Tailored for desktop, tablet, and mobile with intuitive touch controls, collapsible sidebars, and slide-out now-playing drawer.
- **♿ Accessible (a11y)**: Focus rings, ARIA labels, semantic markup, skip navigation, and reduced-motion compliance.
- **🧩 Live Component Showcase**: Explore the design system in real-time at `/design-system`.
- **🤝 Open for Contribution**: Built from the ground up for community collaboration, feature expansion, and API integrations.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Hybrid SSR/SSG, fast routing, and Turbopack engine |
| **Core UI** | [React 19](https://react.dev/) | Concurrent UI rendering and component architecture |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | Strict type safety and predictable data structures |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Ultra-lightweight reactive global store for player & UI |
| **Styling** | Custom Design System + CSS Tokens | High-performance vanilla CSS variables and fluid responsiveness |
| **Typography & Icons** | [Poppins](https://fonts.google.com/specimen/Poppins) & Custom SVGs | Clean modern typography with handcrafted vector icons |
| **Code Quality** | ESLint & Prettier | Automated formatting, linting, and Next.js best practices |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 20.9.0` (Node 22 recommended)
- `npm`, `pnpm`, or `yarn`
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Sahilmd01/Listenify.git
cd Listenify
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env.local
```

Configure your environment parameters (e.g., `NEXT_PUBLIC_SITE_URL=http://localhost:3000`).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start listening.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local dev server using Turbopack |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the built production server locally |
| `npm run lint` | Runs ESLint to check for code quality and standard practices |
| `npm run lint:fix` | Automatically fixes ESLint warnings and errors |
| `npm run typecheck` | Validates TypeScript types across the codebase (`tsc --noEmit`) |
| `npm run format` | Formats all code with Prettier |

---

## 🗺️ Application Routes

| Route | View | Description |
|---|---|---|
| `/` | **Browse / Discover** | Featured hero carousel, trending playlists, top artists, and recent releases |
| `/songs` | **All Songs** | Catalog of tracks with instant play, queue, and filter capabilities |
| `/albums` | **Albums** | Grid of albums with detailed track listings |
| `/artists` | **Artists** | Artist profiles, top tracks, and discography |
| `/radio` | **Radio** | Curated genre and mood stations |
| `/favorites` | **Favorites** | User's saved and liked tracks |
| `/recently-played` | **Recently Played** | History of played audio |
| `/local-files` | **Local Files** | Local track library management |
| `/design-system` | **Design System** | Live interactive component library and style tokens |

---

## 📂 Architecture & Project Structure

```text
Listenify/
├── public/                 # Static assets, logo (icon.svg), app manifest, icons
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, error boundaries)
│   │   ├── (app)/          # Main application shell route group
│   │   ├── layout.tsx      # Root HTML layout, font setup, theme script
│   │   └── not-found.tsx   # Custom 404 page
│   ├── components/
│   │   ├── ui/             # Atomic design components (Button, Modal, Input, Badge, etc.)
│   │   ├── layout/         # Shell components (Sidebar, Topbar, NowPlayingPanel)
│   │   ├── player/         # Audio player controls, waveform, volume & progress bars
│   │   ├── features/       # High-level feature cards, track tables, artist grids
│   │   └── icons/          # Optimized custom inline SVGs (including ListenifyLogo)
│   ├── data/               # Mock music catalog and test data
│   ├── hooks/              # Custom React hooks (useTheme, usePlayerClock, etc.)
│   ├── lib/                # Utility helpers, classnames, formatters, and constants
│   ├── providers/          # Context providers (Toast, Theme, etc.)
│   ├── stores/             # Zustand state stores (player-store, ui-store)
│   ├── styles/             # Design tokens, variables, base styles, and animations
│   └── types/              # TypeScript interfaces and music models
├── DESIGN.md               # Visual identity, tokens, and UX guidelines
└── package.json            # Dependencies and npm scripts
```

---

## 🤝 Contributing

Contributions make the open-source community an inspiring place to learn, create, and build together. Any contributions you make are **greatly appreciated**!

### Contribution Workflow

1. **Fork the Repository**: Click the **Fork** button at the top right of this page.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/Listenify.git
   cd Listenify
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**: Write clean, maintainable, and self-documenting code.
5. **Run Quality Checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm run format
   ```
6. **Commit your changes** following conventional commits:
   ```bash
   git commit -m "feat(player): add keyboard shortcuts for playback"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**: Submit your PR targeting the `main` branch with a clear description of what you changed and why.

---

## 💡 Good First Issues & Roadmap

Looking to contribute? Here are great features and enhancements ready for community help:

- [ ] **Real Audio API integration**: Connect Spotify, Jamendo, Audius, or custom backend streams.
- [ ] **Interactive Equalizer**: Audio visualizer canvas reacting to current audio frequencies.
- [ ] **Custom Playlist Manager**: Drag-and-drop playlist creation, reordering, and export.
- [ ] **Keyboard Shortcuts**: Spacebar play/pause, arrow keys seek & volume adjustments.
- [ ] **Internationalization (i18n)**: Multi-language support.
- [ ] **Automated Testing Suite**: Vitest unit tests and Playwright end-to-end tests.

---

## 🎨 Design System

Listenify follows a custom design system with strict color palettes, typography scales, and micro-interactions. For full details on styling guidelines, check out [`DESIGN.md`](./DESIGN.md) or visit `/design-system` in the app.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Made with ❤️ by [Sahil](https://github.com/Sahilmd01) and the **Listenify Open Source Contributors**.  
If you find Listenify inspiring or helpful, please consider **starring ⭐ the repository**!

</div>
# Open-Source-Music-web-app
