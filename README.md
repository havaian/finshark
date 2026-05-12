# acca-duo

Duolingo-style web app for ACCA practice.

```
acca-duo/
├── backend/                 NestJS + raw SQL via postgres.js
│   ├── db/migrations/       dbmate SQL migrations
│   └── Dockerfile
├── frontend/                Vue 3 + Vite + TS + Tailwind + Pinia
│   ├── nginx.conf           prod nginx config (SPA fallback)
│   └── Dockerfile
├── docker-compose.yml       dev: postgres + backend (hot reload) + frontend (vite)
└── docker-compose.prod.yml  prod: built images, EXTERNAL postgres
```

## Option A — Docker (dev)

One command, includes Postgres:

```
docker compose up
```

- Backend at http://localhost:3001/api (hot reload on file changes)
- Frontend at http://localhost:5173 (Vite HMR)
- Postgres at localhost:5432 (user `acca`, password `acca_dev_password`, db `acca_duo`)

First-run migrations:
```
docker compose exec backend pnpm db:up
```

To wipe everything (including the Postgres volume):
```
docker compose down -v
```

The dev compose has placeholder JWT/unsubscribe secrets. They work for dev. Don't ever use them anywhere real.

## Option B — Bare metal (no Docker)

Prereqs: Node 20+, pnpm 9+, Postgres 15.7 (external), dbmate (`brew install dbmate`).

```
pnpm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp backend/db/dbmate.env.example backend/db/dbmate.env
# edit the three .env files with your real DATABASE_URL + secrets
pnpm db:up
pnpm dev:backend    # in one terminal
pnpm dev:frontend   # in another
```

### Required backend env vars

| Var | Notes |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_ACCESS_SECRET` | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Different value, same generator |
| `UNSUBSCRIBE_SECRET` | Different value, 32 bytes hex |
| `CORS_ORIGIN` | Frontend URL (`http://localhost:5173` in dev) |
| `APP_PUBLIC_URL` | Frontend URL used in email links |

Optional: see `backend/.env.example` for `LLM_PROVIDER`, `EMAIL_MODE` + `SMTP_*`, `REMINDER_CRON`, etc.

## Option C — Docker (prod)

Targets external Postgres. You provide a `.env` at repo root with required vars:

```
DATABASE_URL=postgres://user:pass@your-host:5432/acca_duo
CORS_ORIGIN=https://app.yourdomain.com
APP_PUBLIC_URL=https://app.yourdomain.com
PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
UNSUBSCRIBE_SECRET=...
# optional: LLM_PROVIDER, EMAIL_MODE + SMTP_*, etc.
```

Then:
```
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Run migrations against the external DB (one-off):
```
docker compose -f docker-compose.prod.yml run --rm backend \
  dbmate --url "$DATABASE_URL" --migrations-dir db/migrations up
```

## Migrations

```
pnpm db:up                     # apply pending
pnpm db:down                   # roll back last
pnpm db:status                 # list applied/pending
pnpm db:new my_migration_name  # create db/migrations/<ts>_my_migration_name.sql
```

## First-time setup of an admin user

1. Register a user via the UI.
2. In Postgres:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'you@example.com';
   ```
3. Log out and back in (so the cached profile picks up `is_admin`).
4. Admin → add a paper, then LOs, then questions.

## Manual cron trigger

`POST /api/admin/reminders/run` (admin auth) — runs the daily-reminder pass immediately. With `EMAIL_MODE=log`, the email body is logged to the backend console.