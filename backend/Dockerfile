# syntax=docker/dockerfile:1.7

# Multi-stage build for @finshark/backend on Alpine.
#
# IMPORTANT: this Dockerfile expects the build context to be the REPO ROOT.
# The pnpm workspace needs pnpm-workspace.yaml + both package.json files visible.
#
#   docker build -f backend/Dockerfile -t finshark-backend .
#
# Migrations run at container start via `node-pg-migrate up` (see CMD).
# Idempotent — already-applied migrations are tracked in the pgmigrations table
# and skipped. No external migration tool needed in the image.

# ---------- 1) base: node 24 + pnpm ----------
FROM node:24-alpine AS base
WORKDIR /app

# pnpm via corepack (bundled with Node). Pin to the version we use locally.
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ---------- 2) deps: install workspace deps (cached layer) ----------
FROM base AS deps
WORKDIR /app

# Native-build toolchain for bcrypt. Only present in this build stage; not copied to runtime.
# libc6-compat is sometimes needed by node-gyp shim libs on alpine.
RUN apk add --no-cache --virtual .build-deps python3 make g++ libc6-compat

# Copy ONLY manifests first so dep installs cache cleanly across code changes.
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# Install deps for backend + its workspace dependents. Dev deps included; needed by build stage.
# No lockfile committed, so plain install (not --frozen-lockfile).
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --filter @finshark/backend...

# ---------- 3) build: compile TypeScript ----------
FROM deps AS build
WORKDIR /app
COPY backend/ backend/
RUN pnpm --filter @finshark/backend build

# ---------- 4) prod: slim runtime image ----------
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodeapp && adduser -S -G nodeapp nodeapp

# Copy only what's needed at runtime. Two COPYs is all this needs:
# the workspace root (where pnpm hoists its store) and the entire backend dir.
# pnpm's symlinks in /app/backend/node_modules point into /app/node_modules/.pnpm/,
# so both paths must stay intact at their original locations.
COPY --chown=nodeapp:nodeapp --from=build /app/package.json /app/pnpm-workspace.yaml /app/
COPY --chown=nodeapp:nodeapp --from=build /app/node_modules /app/node_modules
COPY --chown=nodeapp:nodeapp --from=build /app/backend /app/backend

# Run as non-roo
USER nodeapp
# CWD is the backend dir so `node dist/main.js` and `node-pg-migrate up`
# (which defaults to looking in ./migrations) work without extra flags.
WORKDIR /app/backend

EXPOSE 3001
# Run migrations, then start the API. node-pg-migrate is idempotent and tracks
# applied migrations in the pgmigrations table — already-applied ones are skipped.
# If migrations fail, the container exits and won't start with a stale schema.
# main.ts imports dotenv/config — when running in a container we rely on real
# environment variables, not a .env file. dotenv silently no-ops if no file.
CMD ["sh", "-c", "npx node-pg-migrate up && node dist/main.js"]