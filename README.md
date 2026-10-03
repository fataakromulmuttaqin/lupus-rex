# Lupus Rex

Solana MEV & Liquidity Hub — Arbitrage-first MVP.

## Structure

```
lupus-rex/
  apps/
    web/   # Next.js 15 + shadcn/ui frontend
    api/   # NestJS backend API
  packages/
      types/ # Shared TypeScript types
```

## Quick Start

```bash
# From root
npm install

# Setup database (Prisma + SQLite)
cd apps/api
npx prisma generate
npx prisma db push

# Run both apps from root
cd ../..
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

## Environment Variables

`apps/api/.env`
```
DATABASE_URL="file:./dev.db"
```

`apps/web/.env.local` (optional)
```
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## MVP Scope

Phase 1 (current):
- Real wallet authentication (Phantom/Solflare) with ed25519 signature verification
- Prisma/SQLite persistence for users, bots, and trades
- Dashboard overview with live activity feed
- Arbitrage bot create/start/stop/monitor
- Bot execution engine (simulated trades)
- Real-time trade feed over WebSocket (Socket.io)
- Per-bot trade log + realized PnL

Future modules (scaffolded):
- Copy Trading
- Liquidity Management
- Advanced Analytics

## Architecture

```
web (Next.js) --HTTP--> api (NestJS) --WS--> web live feed
                              |
                    ExecutionService (per-bot interval)
                              |
                        TradesService (Prisma/SQLite)
                              |
                        RealtimeGateway (Socket.io)
```

- `apps/api/src/prisma` — Prisma client & module
- `apps/api/src/execution` — per-bot execution loop, emits trades
- `apps/api/src/trades` — trade store (Prisma)
- `apps/api/src/realtime` — Socket.io gateway
- `apps/web/src/components/providers/wallet-provider.tsx` — Solana wallet context
- `apps/web/src/components/providers/ws-provider.tsx` — client socket context

SQLite is used for local development. Switch to PostgreSQL by updating `provider` in `apps/api/prisma/schema.prisma` and running `npx prisma migrate dev`.
