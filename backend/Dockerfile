# syntax=docker/dockerfile:1.7

# Multi-stage build for @acca-duo/backend on Alpine.
#
# IMPORTANT: this Dockerfile expects the build context to be the REPO ROOT.
# The pnpm workspace needs pnpm-workspace.yaml + both package.json files visible.
#
#   docker build -f backend/Dockerfile -t acca-duo-backend .
#
# Alpine note: bcrypt is a native module. On alpine (musl libc) it can't use the
# prebuilt linux-glibc binary, so the install step compiles from source. That
# requires python3 + a C++ toolchain in the deps stage. The runtime stage stays
# tiny because we only copy node_modules and dist over.

# ---------- 1) base: node 24 + pnpm + dbmate ----------
FROM node:24-alpine AS base
WORKDIR /repo

# pnpm via corepack (bundled with Node). Pin to the version we use locally.
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# dbmate static binary, used to run migrations.
# Pinned version; bump intentionally. We use the standard linux-{arch} build
# (not "-musl-"), which is a statically linked Go binary that runs on Alpine
# just fine because we don't need SQLite support — we're on Postgres.
# Historical note: an earlier version of this Dockerfile pinned a URL like
# `dbmate-linux-musl-amd64`, which 404s for recent releases.
ARG DBMATE_VERSION=2.28.0
ARG TARGETARCH
RUN set -eux; \
    apk add --no-cache curl ca-certificates; \
    case "${TARGETARCH}" in \
      amd64) DBMATE_ARCH=amd64 ;; \
      arm64) DBMATE_ARCH=arm64 ;; \
      *) echo "unsupported arch: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    curl -fsSL -o /usr/local/bin/dbmate \
      "https://github.com/amacneil/dbmate/releases/download/v${DBMATE_VERSION}/dbmate-linux-${DBMATE_ARCH}"; \
    chmod +x /usr/local/bin/dbmate; \
    dbmate --version

# ---------- 2) deps: install workspace deps (cached layer) ----------
FROM base AS deps
WORKDIR /repo

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
    pnpm install --filter @acca-duo/backend...

# ---------- 3) build: compile TypeScript ----------
FROM deps AS build
WORKDIR /repo
COPY backend/ backend/
RUN pnpm --filter @acca-duo/backend build

# ---------- 4) prod: slim runtime image ----------
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed at runtime.
COPY --from=build /repo/backend/dist            ./dist
COPY --from=build /repo/backend/package.json    ./package.json
COPY --from=build /repo/backend/db              ./db
COPY --from=build /repo/package.json            /repo/package.json
COPY --from=build /repo/pnpm-workspace.yaml     /repo/pnpm-workspace.yaml
COPY --from=build /repo/node_modules            /repo/node_modules
COPY --from=build /repo/backend/node_modules    ./node_modules

# Drop root. node:*-alpine ships with a `node` user (uid 1000) — reuse it.
RUN chown -R node:node /app /repo
USER node

EXPOSE 3001
# main.ts imports dotenv/config — when running in a container we rely on real
# environment variables, not a .env file. dotenv silently no-ops if no file.
CMD ["node", "dist/main.js"]
