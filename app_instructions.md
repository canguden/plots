# Plots — Privacy‑first analytics for terminal & web

> **Single source of truth for building Plots.**
> This file defines product scope, architecture, UX, and constraints.
> Use /.agents for best practices and latest specs for opentui and react best practices

---

## 0. Core principles (non‑negotiable)

* **Privacy first / GDPR compliant by default**
* **LOC < features** (less code always wins)
* One backend, one data model
* TUI and Web are mirrors, never forks
* No client‑side aggregation
* Sensible defaults, minimal configuration
* Open source, self‑hostable backend

---

## 1. What Plots is

Plots is a **privacy‑first web analytics platform** with:

* A **global CLI** (`plots`) that opens a full‑screen terminal UI
* A **web dashboard** with the same data and views
* A **single lightweight script** for websites
* A **shared backend API** powering everything

Plots is inspired by Plausible, but:

* Terminal‑native first
* Faster iteration for developers
* Open source & self‑hostable

---

## 2. High‑level architecture

```
Website
  └─ plots.js
       └─ POST /api/ingest

Backend (Hono)
  ├─ Auth
  ├─ Billing & usage
  ├─ Aggregation
  └─ ClickHouse (or user DB)

Clients
  ├─ TUI (OpenTUI)
  └─ Web (Next.js)
```

**Rule:**

> All analytics logic lives on the server.

---

## 3. Domains (single domain)

```
plots.sh              marketing + installer
plots.sh/api          backend API (Hono)
plots.sh/app          web dashboard
plots.sh/plots.js     analytics script
```

---

## 4. Privacy & GDPR compliance

Plots is **GDPR‑compliant by design**:

* No cookies
* No localStorage identifiers
* No fingerprinting
* No IP storage (IPs are hashed + discarded)
* No cross‑site tracking

### Data collected per event

* Project ID
* Timestamp
* Path
* Referrer (domain only)
* User agent (coarse parsing only)

### What is NOT collected

* IP addresses (hashed transiently)
* User IDs
* Session replays
* Personal data

### Compliance

* No consent banner required
* Fully anonymous analytics
* EU‑friendly defaults

---

## 5. Backend

### Stack

* Runtime: Node 20+
* Framework: **Hono**
* DB (default): ClickHouse Cloud
* DB (optional): user‑provided ClickHouse
* Auth: Bearer tokens

### Folder structure

```
backend/
  index.ts
  auth.ts
  ingest.ts
  queries.ts
  billing.ts
```

Target: **<700 LOC** total backend

---

## 6. Authentication

* Users authenticate via **API token**
* Same token used by CLI & Web

### Token usage

```
Authorization: Bearer pl_live_xxx
```

### Storage

* CLI: `~/.config/plots/config.json`
* Web: HttpOnly cookie

---

## 7. ClickHouse schema (minimal)

```sql
CREATE TABLE events (
  project_id String,
  ts DateTime,
  path String,
  referrer String,
  country LowCardinality(String),
  device LowCardinality(String),
  browser LowCardinality(String),
  event LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(ts)
ORDER BY (project_id, ts);
```

No sessions table. No users table.

---

## 8. Usage tracking & billing

### Pricing model

* **Free:** 1,000 events / month
* **Starter:** $9 / month → 10,000 events
* **Usage‑based:** overages per additional 10k

### Billing provider

* Stripe
* Monthly subscription
* Metered usage (events count)

### Enforcement

* Events counted server‑side
* Hard cap or soft throttling
* Usage exposed in TUI & Web

Stripe integration is isolated in `billing.ts`.

---

## 9. Ingestion script (`plots.js`)

### Goals

* <3 KB gzipped
* One request per pageview
* SPA navigation support
* Custom events support

### Install

```html
<script
  defer
  src="https://plots.sh/plots.js"
  data-project="proj_x">
</script>
```

### Custom events

```js
import { track } from "plots/analytics";

track("signup");
track("purchase", { value: 29 });
```

---

## 10. CLI (TUI)

### Stack

* OpenTUI
* React (render‑only)

### Commands

```
plots           → open TUI
plots login     → authenticate
plots init      → generate script
plots logout
```

### Views (same as Web)

* Overview
* Pages
* Referrers
* Countries
* Devices
* Events

### Time ranges

* Today
* Yesterday
* Last 7 days
* Last 30 days

### Keyboard‑driven UX

* `/today`
* `/yesterday`
* `/visitors`
* `/countries`
* Ctrl+P → switch project
* R → refresh
* Q → quit

---

## 11. Web dashboard

### Stack

* Next.js (App Router)
* Server Components
* Same API as TUI

### Rule

> Every Web view must exist in TUI.

No Web‑only features.

---

## 12. Shared API contract

Both clients consume identical JSON.

```json
{
  "visitors": 1204,
  "pageviews": 3982,
  "bounceRate": 0.38,
  "series": [12,18,22,30],
  "topPages": []
}
```

---

## 13. Installer (`plots.sh`)

```sh
curl -fsSL https://plots.sh | sh
```

Responsibilities:

* Ensure Node ≥ 20
* Install `plots` globally
* Run `plots login` if needed
* Launch TUI

---

## 14. Marketing website (plots.sh)

### Goals

* Explain value in 5 seconds
* Show install command in hero
* Emphasize privacy & simplicity

### Sections

* Hero (install command)
* How it works
* Privacy promise
* Pricing
* Open source

---

## 15. Open source & self‑hosting

* Backend is open source
* Users can:

  * Bring their own ClickHouse
  * Self‑host API
  * Use CLI & Web against it

Hosted version adds:

* Auth
* Billing
* Managed DB

---

## 16. Codebase structure (monorepo, minimal)

Plots lives in **one monorepo**. No microservices, no duplication.

```
plots/
├─ apps/
│  ├─ web/            # Next.js web dashboard + marketing
│  │  ├─ app/
│  │  ├─ components/
│  │  └─ next.config.ts
│  │
│  ├─ cli/            # plots CLI (OpenTUI)
│  │  ├─ src/
│  │  │  ├─ index.tsx # entry (createCliRenderer)
│  │  │  ├─ app.tsx   # root TUI component
│  │  │  ├─ views/    # overview, pages, countries
│  │  │  └─ state.ts  # minimal global state
│  │  └─ package.json
│  │
│  └─ api/            # Hono backend
│     ├─ src/
│     │  ├─ index.ts  # app bootstrap
│     │  ├─ ingest.ts
│     │  ├─ queries.ts
│     │  ├─ auth.ts
│     │  └─ billing.ts
│     └─ package.json
│
├─ packages/
│  ├─ analytics/      # plots/analytics SDK
│  │  └─ index.ts
│  │
│  ├─ ui/             # shared view models (no React)
│  │  └─ types.ts
│  │
│  └─ config/         # shared config & constants
│     └─ index.ts
│
├─ scripts/
│  └─ install.sh      # served at plots.sh
│
├─ plots.js           # ingestion script (served statically)
│
├─ package.json
├─ tsconfig.json
└─ README.md

---

## 17. How OpenTUI, Next.js, and API connect

### Single API

Both TUI and Web call:

```

GET [https://plots.sh/api/](https://plots.sh/api/)...

```

No client talks to ClickHouse directly.

---

### OpenTUI (CLI)

- Pure client
- Fetches JSON from API
- Renders terminal views
- No business logic

Flow:

```

plots → auth check → fetch data → render

```

---

### Next.js (Web)

- Server Components fetch from same API
- Uses same response types as TUI
- Shares view models from `packages/ui`

Flow:

```

request → server component → API → render HTML

```

---

### Shared types (critical)

All API responses are typed **once**:

```

packages/ui/types.ts

```

Imported by:
- CLI
- Web
- API

This guarantees parity.

---

## 18. Development order (strict)

1. Define API routes + types
2. Implement backend queries
3. Build ingestion script
4. CLI auth + overview
5. Web overview
6. Billing & limits
7. Advanced views

---


## 17. Explicit anti‑goals

- Session recordings
- Heatmaps
- Fingerprinting
- Ad tech integrations
- Complex funnels (v1)

---

## 18. Definition of done

- GDPR compliant without configuration
- Same numbers in TUI and Web
- <1s response time
- Installer works on fresh machine
- Users can self‑host backend

---

This document is the **only specification** for Plots.

```
