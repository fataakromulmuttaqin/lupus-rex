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
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

## MVP Scope

Phase 1 (current):
- Wallet authentication (mock adapter, swap-in ready for Phantom/Solflare)
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
                        TradesService (in-memory)
                              |
                        RealtimeGateway (Socket.io)
```

- `apps/api/src/execution` — per-bot execution loop, emits trades
- `apps/api/src/trades` — trade store
- `apps/api/src/realtime` — Socket.io gateway
- `apps/web/src/components/providers/ws-provider.tsx` — client socket context

Data is currently in-memory; swap in PostgreSQL/Prisma next.
