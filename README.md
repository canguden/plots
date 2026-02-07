# Plots

Privacy-first analytics for terminal & web.

## What is Plots?

Plots is a **privacy-first web analytics platform** with:

- A **global CLI** (`plots`) that opens a full-screen terminal UI
- A **web dashboard** with the same data and views
- A **single lightweight script** for websites
- A **shared backend API** powering everything

## Monorepo Structure

```
plots/
├─ apps/
│  ├─ web/         # Next.js web dashboard
│  ├─ cli/         # OpenTUI terminal interface
│  └─ api/         # Hono backend
├─ packages/
│  ├─ ui/          # Shared types
│  ├─ analytics/   # Client SDK
│  └─ config/      # Shared config
```

## Quick Start

### Install dependencies

```bash
bun install
```

### Set up environment

Copy `.env.local` from `apps/web` to `apps/api/.env` (or create from `.env.example`)

### Run everything

```bash
# All services
bun dev

# Individual services
bun dev:api    # Backend on http://localhost:3001
bun dev:web    # Web on http://localhost:3000
bun dev:cli    # Terminal UI
```

## Development

- **API**: Hono backend with ClickHouse
- **Web**: Next.js with App Router & Server Components
- **CLI**: OpenTUI with React
- **Shared types**: `@plots/ui` ensures parity

## Features

✅ GDPR compliant by design  
✅ No cookies, no tracking  
✅ Real-time analytics  
✅ Terminal & web views  
✅ Self-hostable  

## Tech Stack

- **Runtime**: Bun  
- **Backend**: Hono + ClickHouse  
- **Web**: Next.js 15 + React 19  
- **TUI**: OpenTUI + React  
- **Monorepo**: Bun workspaces + Turbo  

## License

MIT
