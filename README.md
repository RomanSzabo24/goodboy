# GoodBoy Foundation – Donation Form

A donation form for the GoodBoy Foundation, built for the GoodRequest Frontend Assignment. Supporters can donate to the foundation in general or to a specific dog shelter, choose an amount, fill in their details, and submit — with the total raised and donor count shown live from the API.

Full assignment brief: [docs/input/assignment.md](docs/input/assignment.md). API reference: https://frontend-assignment-api.goodrequest.dev/apidoc/ (spec checked in at [docs/input/openapi.json](docs/input/openapi.json)). 

## Tech Stack

- **Framework:** Next.js 16 (App Router, `src/` directory), TypeScript (strict)
- **UI:** shadcn/ui (Radix primitives) + Tailwind CSS v4
- **Server state:** TanStack Query v5
- **Form state:** react-hook-form + Zod v4 (via `@hookform/resolvers`)
- **Shared/multi-step UI state:** Zustand v5
- **i18n:** next-intl (Slovak default, English)
- **Testing:** Vitest + React Testing Library (unit/component), Playwright (e2e)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to a locale-prefixed route (`/sk` by default, `/en` also available).

No environment variables are required — the API base URL (`https://frontend-assignment-api.goodrequest.dev`) is fixed. An optional `NEXT_PUBLIC_SITE_URL` can be set to control the absolute URL used for metadata/OG images in production; it defaults to `http://localhost:3000`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run test` | Run unit/component tests (Vitest) |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run e2e tests (Playwright — builds and starts the app automatically) |

## Project Structure

```
src/
  app/[locale]/         # Routes: home (donation form), about, contact
  components/
    donation-form/      # Multi-step form: shelter, amount, personal details, confirm, success
    layout/              # Site chrome: footer, language switcher
    results/              # Live "total raised / donors" summary
    ui/                   # shadcn/ui primitives
  hooks/                 # TanStack Query hooks (e.g. shelters)
  i18n/                  # next-intl routing/config
  lib/validations/       # Zod schemas — form input and API response shapes
  services/              # API client functions (shelters, results, contribute)
  stores/                # Zustand store for multi-step form state
messages/                # sk/en translation files
e2e/                      # Playwright specs
docker/                  # Dockerfile + docker-compose for containerized runs
```

## Key Business Rules

- **Help type:** general donation (shelter optional) vs. a specific shelter (shelter mandatory).
- **Amount:** preset options or a custom positive value (mandatory).
- **Personal details:** name optional (2–20 chars), surname mandatory (2–30 chars), valid email, SK (+421)/CZ (+420) phone with flag indicator, and mandatory consent for data processing.

See `CLAUDE.md` for the full set of validation and architecture rules this project follows.

## Docker

```bash
docker compose -f docker/docker-compose.yml up --build
```

Builds a standalone production image and serves it on `http://localhost:3000`.

## Testing

- Unit/component tests live alongside the code they cover (`*.test.ts(x)`) and run with `npm run test`.
- E2E specs live in `e2e/` and run with `npm run test:e2e`, which builds and starts the app before driving it with Playwright.
