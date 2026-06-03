# syntax=docker/dockerfile:1.7

# Multi-stage build for @finshark/frontend on Alpine.
#
# IMPORTANT: build context is the REPO ROOT, same as backend/Dockerfile.
#   docker build -f frontend/Dockerfile -t finshark-frontend .
#
# Vite bakes VITE_API_BASE_URL into the bundle at build time. Pass it as a
# build ARG; for different envs (staging/prod) build separate images.

# ---------- 1) base: node 24 + pnpm ----------
FROM node:24-alpine AS base
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ---------- 2) deps ----------
FROM base AS deps
WORKDIR /repo
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --filter @finshark/frontend...

# ---------- 3) build ----------
FROM deps AS build
WORKDIR /repo

# Vite bakes this into the JS bundle. Default points at the docker compose
# dev network alias; override for prod builds via `--build-arg`.
ARG VITE_API_BASE_URL=http://localhost:3001/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY frontend/ frontend/
RUN pnpm --filter @finshark/frontend build

# ---------- 4) runtime: nginx serving static assets ----------
# nginx alpine is independent of the Node 24 base; once built, no Node at runtime.
FROM nginx:1.27-alpine AS prod

# SPA history-mode fallback: any unknown path serves index.html so client-side
# routing can take over. /api/* is NOT proxied here - the compose file handles
# routing (the frontend container talks to the backend container by service name).
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /repo/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
