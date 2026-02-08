# marcelodiani.com

Personal portfolio website built with Next.js 16, React 19, and Three.js. Features interactive demos, real-time data widgets, an AI chat assistant, a code playground, and engineering visualizers — all wrapped in a bilingual (EN/PT) experience.

> **Live:** [marcelodiani.com](https://marcelodiani.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com) |
| 3D | [Three.js](https://threejs.org) via React Three Fiber + Drei |
| Animation | [Framer Motion](https://motion.dev), [GSAP](https://gsap.com) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) + OpenAI |
| i18n | [next-intl](https://next-intl.dev) (English & Portuguese) |
| Database | PostgreSQL ([Neon](https://neon.tech) in prod, Docker locally) |
| Email | [Resend](https://resend.com) |
| Validation | [Zod](https://zod.dev) |
| Sandbox | [E2B](https://e2b.dev) (code execution) |
| Language | TypeScript 5 |

---

## Features

### Portfolio Sections

- **Hero** — 3D scene with floating shapes and particle field
- **About** — stats, spoken languages, and animated counters
- **Experience** — professional timeline
- **Skills** — interactive 3D tech sphere
- **Projects** — showcase gallery
- **Education** — academic background and achievements
- **Contact** — quote request form with email notifications

### Interactive Demos

- **Code Playground** — write and execute code in multiple languages (via Piston API & E2B sandbox)
- **Architecture Simulator** — cloud flow, observability, and auto-scaling visualizations
- **Interactive Lab** — signal visualizer, circuit simulator, tree/algorithm visualizer, neural network, control systems, concurrency patterns, calculus, physics simulator, database visualizer, logic gates, transmission lines, optical fiber, and transistor architecture
- **Platform Jump Game** — Canvas-based game with scoreboard
- **Typing Challenge** — code typing speed game
- **Tetris** — auto-playing Tetris
- **Walking Boy** — animated character

### Real-Time Data Widgets

| Widget | Source | API Key |
|--------|--------|---------|
| Weather | [Open-Meteo](https://open-meteo.com) | No |
| Cryptocurrency | [CoinGecko](https://www.coingecko.com) | No |
| Exchange Rates | [Frankfurter](https://frankfurter.dev) | No |
| Gold Prices | [GoldAPI.io](https://www.goldapi.io) | Yes (free tier) |
| Stock Prices | [Alpha Vantage](https://www.alphavantage.co) | Yes (free tier) |
| Sports Results | [TheSportsDB](https://www.thesportsdb.com) | No |
| Flight Tracking | [OpenSky Network](https://opensky-network.org) | No |

### AI Chat Assistant

An embedded chat powered by GPT-4o-mini with full CV context, capable of answering questions about my experience, generating charts, and tracking conversation budgets.

### Engineering Highlights

- Server-side rate limiting on all endpoints
- Circuit breakers and retry logic for external APIs
- Daily API caching for world data widgets
- Input sanitization with Zod
- Client-side error reporting
- Security headers (HSTS, X-Frame-Options, CSP-adjacent policies)
- SEO: sitemap, robots.txt, structured data (JSON-LD), Open Graph

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ 
- [Docker](https://www.docker.com) (optional — only for the local database)

### Installation

```bash
git clone https://github.com/marcelodiani/marcelodiani.git
cd marcelodiani
npm install
```

### Environment Variables

Copy the example file and fill in any keys you need:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | PostgreSQL connection string. Enables likes, quote requests, and guestbook. |
| `RESEND_API_KEY` | No | [Resend](https://resend.com) key for email notifications on quote requests. |
| `OPENAI_API_KEY` | No | [OpenAI](https://platform.openai.com) key for the AI chat assistant. |
| `E2B_API_KEY` | No | [E2B](https://e2b.dev) key for sandboxed code execution. |
| `ADMIN_API_KEY` | No | Secret for the admin logs API endpoint. |
| `GOLDAPI_KEY` | No | [GoldAPI.io](https://www.goldapi.io) key for gold price widget. |
| `ALPHA_VANTAGE_KEY` | No | [Alpha Vantage](https://www.alphavantage.co) key for stock price widget. |

> The site runs fully without any env variables — features that depend on them gracefully degrade or show placeholder states.

### Running Locally

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Database (optional)

```bash
# Start PostgreSQL via Docker
npm run db:up

# Stop
npm run db:down

# Reset (destroys data)
npm run db:reset
```

The `DATABASE_URL` in `.env.example` is pre-configured for Docker.

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-routed pages (en, pt)
│   ├── actions/           # Server actions (code execution, likes, quotes)
│   ├── api/               # API routes (chat, logs, world-data/*)
│   ├── layout.tsx         # Root layout
│   ├── robots.ts          # robots.txt generation
│   └── sitemap.ts         # XML sitemap generation
├── components/
│   ├── about/             # About section
│   ├── chat/              # AI chat bubble and panel
│   ├── contact/           # Contact form and quote request
│   ├── education/         # Education section
│   ├── experience/        # Experience timeline
│   ├── hero/              # Hero section
│   ├── interactive/       # Games, terminal, walking boy, tetris
│   ├── interactiveLab/    # Engineering visualizers
│   ├── layout/            # Navbar, footer, audio player
│   ├── projects/          # Projects showcase
│   ├── security/          # Security awareness section
│   ├── skills/            # Skills section
│   ├── three/             # Three.js 3D scenes
│   ├── timezone/          # World clock
│   ├── ui/                # Shared UI components
│   └── worldData/         # Real-time data widgets
├── data/                  # Static data (skills, algorithms, circuits, etc.)
├── enums/                 # TypeScript enums
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization config
├── lib/                   # Utilities (DB, email, cache, rate-limit, etc.)
└── middleware.ts          # i18n routing middleware
messages/
├── en.json                # English translations
└── pt.json                # Portuguese translations
```

---

## Deployment

The project is designed to deploy on [Vercel](https://vercel.com) with zero configuration. See [DEPLOY.md](./DEPLOY.md) for a step-by-step guide covering:

- Connecting the repository
- Setting up Neon Postgres
- Configuring environment variables
- Custom domains

Every push to `main` triggers an automatic production deployment.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:up` | Start local PostgreSQL (Docker) |
| `npm run db:down` | Stop local PostgreSQL |
| `npm run db:reset` | Reset local database (destroys data) |

---

## License

This project is open source under the [MIT License](./LICENSE).
