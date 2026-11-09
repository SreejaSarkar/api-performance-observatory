# API Performance Observatory

**Live App:** [https://api-performance-observatory.vercel.app](https://api-performance-observatory.vercel.app)

API Performance Observatory is a full-stack API monitoring platform. It ingests API
metrics (latency, error rates, traffic) in real time through a lightweight SDK, detects
anomalies using per-endpoint statistical baselines, and surfaces everything on a live
dashboard with alert rules, webhook notifications, SLA tracking, and exportable reports.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Monorepo Layout](#monorepo-layout)
- [Prerequisites](#prerequisites)
- [Backend](#backend)
- [Frontend](#frontend)
- [SDK](#sdk)
- [API Documentation](#api-documentation)

## Architecture

```
┌──────────────┐    metrics     ┌──────────────┐    queries     ┌──────────────┐
│  Your API +  │ ─────────────▶ │   Backend    │ ◀───────────── │   Frontend   │
│  Observatory │   (HTTP/SDK)   │  (NestJS)    │   REST + WS    │  (Next.js)   │
│     SDK      │                │              │ ─────────────▶ │  Dashboard   │
└──────────────┘                └──────┬───────┘   live updates └──────────────┘
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼             ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │ Postgres │ │  Redis   │ │ Webhooks │
                    │ (Prisma) │ │ (cache)  │ │ (alerts) │
                    └──────────┘ └──────────┘ └──────────┘
```

## Features

- **Real-time metric ingestion** via the `@sreejasarkar/api-observatory` SDK (API-key auth).
- **Live dashboard** with latency, error rate, and traffic charts over Socket.IO.
- **Anomaly detection** using per-endpoint statistical baselines.
- **Alert rules** with configurable metrics, thresholds, and severities.
- **Webhook notifications** for alert and anomaly events.
- **Reports** exportable as CSV/PDF.
- **Auth** with email/password plus Google and GitHub OAuth, JWT access/refresh tokens.
- **Projects & roles** (OWNER / ADMIN / MEMBER / VIEWER) with scoped API keys.
- **OpenAPI/Swagger** documentation served from the backend.

## Tech Stack

| Layer     | Technology                                                            |
| --------- | --------------------------------------------------------------------- |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4, Recharts, Socket.IO client      |
| Backend   | NestJS 11, Prisma 6, PostgreSQL, Redis (ioredis), Socket.IO, Passport |
| SDK       | TypeScript, Axios (Express middleware + NestJS interceptor)           |
| Tooling   | TypeScript, Jest, ESLint, Prettier, Docker Compose                    |

## Monorepo Layout

```
api-performance-observatory/
├── backend/     # NestJS API, Prisma schema, WebSocket gateway
├── frontend/    # Next.js dashboard
└── sdk/         # Publishable TypeScript metrics SDK
```

## Prerequisites

- Node.js `18+`
- PostgreSQL `14+`
- Redis `6+`
- (Optional) Docker + Docker Compose for local Postgres/Redis

---

## Backend

A NestJS API that ingests metrics, runs anomaly detection and alert evaluation on a
schedule, persists data with Prisma/PostgreSQL, caches with Redis, and streams live
updates to the dashboard over Socket.IO.

### Modules

- `auth` — local + Google/GitHub OAuth, JWT access/refresh tokens, guards.
- `projects` — project CRUD, API-key management, memberships and roles.
- `metrics` — metric ingestion and querying.
- `anomalies` — per-endpoint baselines and anomaly detection.
- `alerts` — alert rules and alert events.
- `webhooks` — outbound webhook delivery.
- `dashboard` — aggregated dashboard data and live updates.
- `reports` — CSV/PDF report generation.
- `health` — health checks.

### Environment Variables

Create `backend/.env`:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/observatory"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="replace-with-a-long-random-string"
JWT_REFRESH_SECRET="replace-with-another-long-random-string"

# Optional
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/observatory"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
COOKIE_DOMAIN=""
PORT=3001

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:3001/auth/github/callback"
```

### Setup

```bash
cd backend
npm install

# Start Postgres + Redis locally (optional)
docker compose up -d

# Generate Prisma client and apply migrations
npm run db:generate
npm run db:migrate:deploy

# (Optional) seed sample data
npx prisma db seed
```

### Run

```bash
npm run start:dev     # watch mode
npm run start         # standard
npm run start:prod    # production (after npm run build)
```

The API runs on `http://localhost:3001` by default.

### Scripts

| Script                      | Description             |
| --------------------------- | ---------------------- |
| `npm run start:dev`         | Start in watch mode    |
| `npm run build`             | Compile to `dist/`     |
| `npm run db:generate`       | Generate Prisma client |
| `npm run db:migrate:deploy` | Apply migrations       |
| `npm run lint`              | Lint and auto-fix      |
| `npm run test`              | Unit tests             |
| `npm run test:e2e`          | End-to-end tests       |
| `npm run test:cov`          | Coverage report        |

---

## Frontend

A Next.js dashboard that visualizes metrics and anomalies, manages projects, alert
rules, and webhooks, and subscribes to live updates over Socket.IO.

### Pages

- `projects` — project selection and management
- `dashboard` — live metrics overview
- `endpoints` — per-endpoint breakdown
- `anomalies` — detected anomalies
- `alerts` — alert rules and events
- `webhooks` — webhook configuration
- `reports` — report generation and export
- `auth` — login / signup / OAuth

### Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> Point `NEXT_PUBLIC_API_URL` at your deployed backend in production.

### Setup & Run

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

### Scripts

| Script          | Description             |
| --------------- | ---------------------- |
| `npm run dev`   | Start dev server       |
| `npm run build` | Production build       |
| `npm run start` | Serve production build |
| `npm run lint`  | Lint                   |
| `npm run test`  | Run tests              |

The frontend is deployed on Vercel: **[https://api-performance-observatory.vercel.app](https://api-performance-observatory.vercel.app)**

---

## SDK

`@sreejasarkar/api-observatory` is a TypeScript SDK that sends API performance metrics
to the Observatory backend. It supports direct submission, buffered batching, Express
middleware, and a NestJS interceptor.

```ts
import { Observatory } from "@sreejasarkar/api-observatory";

const observatory = new Observatory({
  apiKey: process.env.OBSERVATORY_API_KEY!,
  serverUrl: process.env.OBSERVATORY_SERVER_URL,
  environment: process.env.NODE_ENV,
});
```

See [`sdk/README.md`](./sdk/README.md) for installation and full usage.

---

## API Documentation

With the backend running, interactive Swagger docs are available at:

```
http://localhost:3001/api/docs
```

Authentication is supported via `x-api-key` header (projects) and Bearer JWT (users).
