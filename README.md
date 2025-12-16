# Integrated Timekeeping Solution

Integrated time tracking, forecasting, analytics, and search for project teams. Built with Next.js App Router, Prisma + PostgreSQL, NextAuth credentials, and the Carbon design system.

## Tech Stack
- Next.js 16 (App Router, standalone output), React 19
- NextAuth Credentials (JWT sessions)
- Prisma 7 with PostgreSQL (generated client in `generated/prisma`)
- Styling: Carbon Design System (`@carbon/react`), IBM Plex Sans, SCSS
- Charts: Chart.js + `react-chartjs-2`
- Tooling: Biome (lint/format), Jest + Testing Library, Husky, Commitlint
- Container: Node 22 Alpine multi-stage Dockerfile, Vercel deploys

## Project Structure (high level)
- `app/` – App Router pages, layouts, and feature pages (login, timesheet, forecast, analytics, search)
- `components/` – Shared UI components (forms, charts, tables, wrappers)
- `actions/` – Server actions grouped by feature domains
- `providers/` – Context and notification providers
- `styles/` – Carbon and global styles
- `prisma/` – Schema, client instantiation, docker-compose, seed scripts
- `types/` – Shared TypeScript types
- `utils/` – Auth, validation, export, and feature utilities
- `public/` – Static assets

## Environment Variables
Copy `.example-env` to `.env.local` (Next.js), `.env` (CLI/Prisma), or provide them in CI/CD. Connection strings follow the PostgreSQL URI format: `postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public`.

| Variable | Required | Description |
| --- | --- | --- |
| `AUTH_SECRET` | Yes | NextAuth secret used to sign JWT sessions. Generate with `openssl rand -hex 32`. |
| `DATABASE_URL` | Yes (build/prod) | Primary Postgres connection. Used in production and for migrations/builds (also passed in CI). |
| `LOCAL_DATABASE_URL` | Yes (local dev) | Postgres connection for local development. Used when `NODE_ENV !== production` (see `prisma/prisma.ts`). |
| `DIRECT_URL` | Optional | Direct connection for Prisma migrate/Studio (recommended for pooled DBs). |
| `BASE_URL` | Optional | Base URL for app links or auth callbacks if needed (e.g., `http://localhost:3000`). |

## Prerequisites
- Node 20+ (Node 22 aligns with the Docker base image)
- npm (lockfile present), Docker Desktop (for local Postgres via compose)

## Local Development
1) Install deps
```bash
npm ci
```

2) Set env vars
```bash
cp .example-env .env.local
# fill in AUTH_SECRET, DATABASE_URL, LOCAL_DATABASE_URL, etc.
```

3) Start Postgres locally (detached)
```bash
npm run db   # runs prisma/docker-compose.yml
```

4) Apply schema and generate client
```bash
npx prisma db push        # or prisma migrate dev --name init
npx prisma generate
```

5) Seed data (optional but recommended)
- Base data (week endings, roles, categories, statuses):
```bash
npx ts-node prisma/seeds/seed.ts
```
- Sample users/projects/codes/work items/bill codes/categories (prints plaintext+hashed passwords to console):
```bash
npx ts-node prisma/seeds/seedUserInformation.ts
```
Note: Seed scripts reference `npx tsx` in comments; `ts-node` is already installed and works as shown. Ensure the DB is running and env vars are set.

6) Run the app
```bash
npm run dev
# http://localhost:3000
```

## Testing, Linting, and Formatting
- Unit tests (Jest, jsdom): `npm test` (see `jest.config.ts`, `jest.setup.ts`)
- Lint: `npm run lint` (Biome)
- Format: `npm run format` (Biome write)
- Type check: `npm run type-check`
- Combined local quality gate: `npm run localquality`

### Husky and Commitlint
- `npm run prepare` installs Husky hooks.
- Pre-commit hook runs format → lint → type-check → test and stages changes.
- Commit messages are validated via conventional commits (see `commitlint.config.ts`).

## Authentication
- NextAuth Credentials provider (`auth.ts`).
- Users are looked up via Prisma and verified with PBKDF2 hashing utilities in `utils/auth/password.ts`.
- JWT session strategy; `session.user.id` set from token subject.

## Database & Prisma
- Schema defined in `prisma/schema.prisma`; client created in `prisma/prisma.ts` using `@prisma/adapter-pg`.
- Local vs production connection string chosen by `NODE_ENV`.
- Generated client output: `generated/prisma` (included in build; excluded from lint/format by Biome).
- Seed scripts live in `prisma/seeds/`. `createAndHashPasswords.ts` fetches random strong passwords and hashes them.

### Data Model Highlights
- Core identities: `User`, `Role`, `UserRoles`, `UserResourceManagers`
- Projects and work tracking: `Project`, `Code`, `WorkItem`, `BillCode`
- Timesheets: `Timesheet`, `TimesheetEntry`, `TimesheetStatus`, `TimesheetWeekEnding`
- Forecasting: `ForecastPlan`, `ForecastEntry`, `ForecastWeeklyBreakdown`, `Category`
- Audit trail: `AuditLog`

## Frontend Overview
- Root layout applies IBM Plex Sans and Carbon styles (`app/layout.tsx`, `app/styles`).
- Default route renders the login experience (`app/page.tsx`).
- Feature pages live under `app/(pages)/{login, timesheet, forecast, analytics, search}` with shared components in `components/` and server actions in `actions/`.
- Middleware-like proxy (`proxy.ts`) injects `x-current-pathname` header via `auth` wrapper.

## Tooling and Configuration
- Biome config: `biome.json` (format/lint, ignores `.next`, `generated`, `coverage`)
- Jest config: `jest.config.ts` with `jest.setup.ts` (fake timers, DOM polyfills, matchMedia mock)
- Next config: `next.config.ts` sets `output: standalone` for Docker/Vercel
- Prisma config: `prisma.config.ts` points to `prisma/schema.prisma`
- npm config: `.npmrc` forces exact versions

## Docker
- Build local image: `npm run localbuild` (or `docker build --no-cache -t its-local:latest .`)
- Build args: `DATABASE_URL` and `LOCAL_DATABASE_URL` (defaults are placeholders; override for reproducible builds)
- Runtime exposes port 3000 and runs `server.js` from the standalone Next build. Non-root user `nextjs` is used in the final stage.

## CI/CD
- Pull requests: `Open MR Deployment Checks` runs npm ci, lint, Prisma generate, tests, type-check, and a Docker build with DB connection args.
- `develop` branch: Vercel preview build/deploy.
- `main` branch: Vercel production build/deploy.
- Dependabot weekly for npm (targeting `develop`, grouped React updates).

## Helpful Commands
- Start DB only: `npm run db`
- Prisma Studio (interactive DB): `npx prisma studio`
- Regenerate Prisma client: `npx prisma generate`
- Run a single test file: `npx jest path/to/file.test.tsx`

## Troubleshooting
- If auth fails locally, ensure seed users were created and passwords printed by `seedUserInformation.ts` are used.
- If Prisma client is missing, rerun `npx prisma generate` after installing dependencies or changing the schema.
- For commit hook failures, run `npm run format && npm run lint && npm run type-check && npm test` and retry.
