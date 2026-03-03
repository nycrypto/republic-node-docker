# republic-node-docker (template)

A simple, security-minded **Docker Compose + Caddy** template to run:
- a **Republic/RAI node** (as a Docker container you provide)
- an optional **read-only dashboard** (included in this repo)

This repo is **generic**: no personal IPs, ports, or addresses are hardcoded.

## What you get
- `docker compose up -d` to start services
- Dashboard behind **Caddy** reverse proxy (recommended)
- Localhost-only access patterns by default

> Important: You must set the correct node image and node command for your network.
> This template does not ship the node binary.

## Quick start
1) Copy env file:
   - `cp .env.example .env`
2) Edit `.env`:
   - `NODE_IMAGE` (required)
3) Start:
   - `docker compose up -d --build`

## Security notes
- Do **NOT** expose node RPC to the internet.
- Put the dashboard behind **Basic Auth** (Caddy).
- Keep secrets in `.env` (never commit it).

## Files
- `docker-compose.yml` - services
- `Caddyfile` - reverse proxy + basic auth
- `dashboard/` - minimal read-only dashboard (Node.js)
- `.env.example` - config placeholders
