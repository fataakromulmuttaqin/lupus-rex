'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useWs } from '@/components/providers/ws-provider';
import { Icon } from '@/components/ui/icon';
import { Bot, Opportunity, Trade, TradeExecutedEvent } from '@/lib/types';

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString();
}

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const { socket } = useWs();

  const fetchBots = () => api.get('/bots').then((r) => setBots(r.data as Bot[])).catch(() => {});
  const fetchOpportunities = () => api.get('/arbitrage/opportunities').then((r) => setOpportunities(r.data as Opportunity[])).catch(() => {});
  const fetchTrades = () => api.get('/bots/trades/all').then((r) => setTrades(r.data as Trade[])).catch(() => {});

  useEffect(() => {
    fetchBots();
    fetchOpportunities();
    fetchTrades();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onTrade = (event: TradeExecutedEvent) => {
      const line = `[${formatTime(event.timestamp)}] [EXEC] ${event.pair} net +${event.profit.toFixed(6)} SOL`;
      setLogs((prev) => [line, ...prev].slice(0, 20));
      fetchTrades();
      fetchBots();
    };
    socket.on('trade.executed', onTrade);
    return () => {
      socket.off('trade.executed', onTrade);
    };
  }, [socket]);

  const totalPnl = trades.reduce((sum, t) => sum + Number(t.profit), 0);
  const running = bots.filter((b) => b.status === 'running');
  const paused = bots.filter((b) => b.status === 'paused' || b.status === 'stopped');

  const toggle = async (id: string, nextStatus: 'running' | 'stopped') => {
    await api.post(`/bots/${id}/${nextStatus === 'running' ? 'start' : 'stop'}`);
    fetchBots();
    fetchTrades();
  };

  return (
    <div className="space-y-6">
      {/* Engine Control + Telemetry */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm xl:flex-row xl:items-center">
          <div className="flex max-w-2xl flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-profit-emerald animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase font-bold tracking-wider text-profit-emerald">Sub-second Cross-DEX Execution</span>
              <span className="font-label-caps text-label-caps text-text-muted">/</span>
              <span className="font-label-caps text-label-caps font-semibold text-sky-700">JITO BUNDLE V4 ENGINE</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-bold">MEV &amp; Arbitrage Engine Control</h1>
            <p className="text-sm leading-relaxed text-text-secondary">Ultra-low latency JIT &amp; triangular arbitrage across Raydium CLMM/CPMM, Meteora DLMM, and Orca Whirlpools with dynamic tip prioritization.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/arbitrage/new">
              <Button className="flex items-center gap-1.5 bg-primary font-headline-sm text-sm font-semibold text-white hover:bg-primary/90">
                <Icon name="add_circle" className="text-lg" />
                <span>Create Arbitrage Bot</span>
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center gap-1.5 border-border-subtle bg-white font-headline-sm text-sm font-medium text-text-primary hover:bg-slate-50">
              <Icon name="science" className="text-lg text-sky-600" />
              Dry-Run Simulation
            </Button>
            <Button variant="outline" className="flex items-center gap-1.5 border-border-subtle bg-white font-headline-sm text-sm font-medium text-text-primary hover:bg-slate-50">
              <Icon name="alt_route" className="text-lg text-solana-purple" />
              Prism Route Builder
            </Button>
            <Button variant="destructive" className="flex items-center gap-1.5 font-headline-sm text-sm font-semibold">
              <Icon name="dangerous" className="text-lg" />
              Kill Switch
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <TelemetryCard title="Total Arb PnL (24h)" icon="trending_up" iconColor="text-profit-emerald" value={`+${totalPnl.toFixed(2)}`} unit="SOL" sub="≈ $" subValue={(totalPnl * 154.2).toLocaleString(undefined, { maximumFractionDigits: 2 })} progress={Math.min((totalPnl / 65) * 100, 100)} progressColor="bg-profit-emerald" />
          <TelemetryCard title="Execution Success" icon="done_all" iconColor="text-sky-600" value="94.2%" unit="324 / 344" sub="20 reverts" progress={94.2} progressColor="bg-sky-500" />
          <TelemetryCard title="Average Latency" icon="speed" iconColor="text-warning-amber" value="38" unit="ms" sub="p99: 64ms" tag="TRITON RELAY" tagColor="text-amber-700 bg-amber-50 border-amber-200" progress={35} progressColor="bg-amber-500" />
          <TelemetryCard title="Flashloan Volume" icon="bolt" iconColor="text-solana-purple" value="$420,850" unit="SOLEND" sub="0 Fee Tier" progress={65} progressColor="bg-solana-purple" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Icon name="precision_manufacturing" className="text-sky-600" />
              <h2 className="font-headline-md text-headline-md font-bold text-text-primary">Active Arbitrage Bots</h2>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-label-caps text-label-caps font-bold text-sky-700">{bots.length} DEPLOYED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps text-text-muted font-medium">GLOBAL SLIPPAGE:</span>
              <span className="rounded border border-border-subtle bg-white px-2 py-0.5 font-data-sm font-semibold text-text-primary shadow-xs">0.08% max</span>
            </div>
          </div>

          {running.length > 0 && <DetailedBotCard bot={running[0]} onToggle={toggle} />}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {running.slice(1).concat(paused.slice(0, Math.max(0, 2 - running.length + 1))).map((bot) => (
              <CompactBotCard key={bot.id} bot={bot} onToggle={toggle} />
            ))}
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="tune" className="text-sky-600" />
                <span className="font-headline-sm font-bold text-text-primary">Active Global Routing Parameters</span>
              </div>
              <span className="font-label-caps text-label-caps text-text-muted font-medium">AUTO-REBALANCING TICK: 250ms</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <RoutingParam label="MAX JITO TIP (SOL)" value="0.035" unit="SOL/TX" />
              <RoutingParam label="FAIL-SAFE SLIPPAGE LIMIT" value="0.12" unit="% MAX" />
              <RoutingParam label="CONCURRENT ARB SLOTS" value="8" unit="BUNDLES" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <OpportunityScanner opportunities={opportunities} />
          <ExecTerminal logs={logs} />
        </div>
      </div>

      {/* Trades Table */}
      <TradeHistoryTable trades={trades} />
    </div>
  );
}

function TelemetryCard({
  title,
  icon,
  iconColor,
  value,
  unit,
  sub,
  subValue,
  progress,
  progressColor,
  tag,
  tagColor,
}: {
  title: string;
  icon: string;
  iconColor: string;
  value: string;
  unit: string;
  sub?: string;
  subValue?: string;
  progress: number;
  progressColor: string;
  tag?: string;
  tagColor?: string;
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-border-subtle bg-surface-subtle p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-body-sm text-body-sm font-medium uppercase text-text-muted">{title}</span>
        <Icon name={icon} className={classNames('text-body-lg', iconColor)} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-data-lg font-bold text-text-primary">{value}</span>
        {tag ? (
          <span className={classNames('rounded border px-1.5 py-0.5 font-label-caps text-label-caps font-bold', tagColor)}>{tag}</span>
        ) : (
          <span className={classNames('font-label-caps text-label-caps', iconColor, 'font-semibold')}>{unit}</span>
        )}
        {sub && <span className="ml-auto font-data-sm font-medium text-text-muted">{sub}{subValue}</span>}
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-slate-100">
        <div className={classNames('h-full', progressColor)} style={{ width: `${Math.min(progress, 100)}%` }}></div>
      </div>
    </div>
  );
}

function DetailedBotCard({ bot, onToggle }: { bot: Bot; onToggle: (id: string, status: 'running' | 'stopped') => void }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  useEffect(() => {
    api.get(`/bots/${bot.id}/trades`).then((r) => setTrades(r.data as Trade[])).catch(() => {});
  }, [bot.id]);
  const pnl = trades.reduce((sum, t) => sum + Number(t.profit), 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-border-subtle bg-surface-variant p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-sky-100 text-sky-700">
            <Icon name="sync_alt" className="text-headline-sm" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm font-bold text-text-primary">{bot.name}</span>
              <span className="flex items-center gap-1 rounded border border-emerald-200 bg-emerald-100/80 px-2 py-0.5 font-label-caps text-label-caps font-bold text-profit-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-profit-emerald animate-ping"></span> RUNNING
              </span>
              <span className="rounded border border-border-subtle bg-white px-2 py-0.5 font-label-caps text-label-caps text-text-muted">ID: #{bot.id.slice(0, 6)}</span>
            </div>
            <span className="text-sm text-text-secondary">Atomic Multi-Pool Cycle • Mainnet Jito-Solana</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onToggle(bot.id, 'stopped')} className="flex items-center gap-1 border-border-subtle bg-white font-label-caps text-label-caps font-semibold text-amber-700 hover:bg-slate-50">
            <Icon name="pause" className="text-body-sm" /> Pause
          </Button>
          <Link href={`/arbitrage/${bot.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1 border-border-subtle bg-white font-label-caps text-label-caps font-medium text-text-primary hover:bg-slate-50">
              <Icon name="tune" className="text-body-sm" /> Config
            </Button>
          </Link>
          <Link href={`/arbitrage/${bot.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1 border-sky-200 bg-sky-50 font-label-caps text-label-caps font-semibold text-sky-700 hover:bg-sky-100">
              <Icon name="receipt_long" className="text-body-sm" /> Logs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <ParamBox label="Base Asset & Route" value="SOL → USDC" />
        <ParamBox label="DEX Liquidity Pools" value="Raydium CLMM" />
        <ParamBox label="Min Net Profit" value={`≥ ${bot.config.minProfitLamports ? (Number(bot.config.minProfitLamports) / 1e9).toFixed(3) : '0.05'} SOL`} valueColor="text-profit-emerald" />
        <ParamBox label="CU Budget & Flashloan" value="320k CU" tag="FLASH ACTIVE" />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-variant p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps font-semibold text-text-secondary">REAL-TIME PROFIT STREAM</span>
            <span className="rounded border border-emerald-200 bg-emerald-100 font-data-sm font-bold text-profit-emerald px-1.5 py-0.5">+{pnl.toFixed(2)} SOL</span>
          </div>
          <span className="font-label-caps text-label-caps text-text-muted">TIP STRATEGY: <strong className="text-warning-amber">Dynamic Aggressive</strong></span>
        </div>
        <svg className="h-20 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 80">
          <defs>
            <linearGradient id="pnlGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#059669" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0,75 L20,70 L50,72 L80,60 L110,62 L140,50 L170,55 L200,42 L230,45 L260,30 L290,34 L320,20 L350,22 L380,15 L410,18 L440,10 L470,8 L500,2" fill="none" stroke="#059669" strokeWidth="2.5"></path>
          <path d="M0,75 L20,70 L50,72 L80,60 L110,62 L140,50 L170,55 L200,42 L230,45 L260,30 L290,34 L320,20 L350,22 L380,15 L410,18 L440,10 L470,8 L500,2 L500,80 L0,80 Z" fill="url(#pnlGrad)"></path>
          <circle cx="500" cy="2" fill="#0284c7" r="4.5" stroke="#ffffff" strokeWidth="2"></circle>
        </svg>
        <div className="flex justify-between font-label-caps text-label-caps text-text-muted">
          <span>Start</span>
          <span>Mid</span>
          <span className="font-bold text-profit-emerald">Now</span>
        </div>
      </div>
    </div>
  );
}

function ParamBox({ label, value, valueColor, tag }: { label: string; value: string; valueColor?: string; tag?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border-subtle bg-surface-variant p-2">
      <span className="font-label-caps text-label-caps font-medium text-text-muted">{label}</span>
      <div className="font-data-md font-semibold text-text-primary flex items-center justify-between">
        <span className={valueColor}>{value}</span>
        {tag && <span className="rounded border border-purple-200 bg-purple-100 px-1 py-0.5 font-label-caps text-label-caps font-bold text-purple-800">{tag}</span>}
      </div>
    </div>
  );
}

function CompactBotCard({ bot, onToggle }: { bot: Bot; onToggle: (id: string, status: 'running' | 'stopped') => void }) {
  const isRunning = bot.status === 'running';
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-border-subtle bg-surface-subtle p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm font-bold text-text-primary">{bot.name}</span>
            <span className={classNames('flex items-center gap-1 rounded border px-1.5 py-0.5 font-label-caps text-label-caps font-bold', isRunning ? 'border-emerald-200 bg-emerald-100 text-profit-emerald' : 'border-amber-200 bg-amber-100 text-amber-800')}>
              <span className={classNames('h-1.5 w-1.5 rounded-full', isRunning ? 'bg-profit-emerald' : 'bg-amber-600')}></span> {isRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
          <span className="text-sm text-text-secondary">Atomic Multi-Pool Cycle</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-border-subtle bg-surface-variant p-2">
          <span className="font-label-caps text-label-caps text-text-muted block">STATUS</span>
          <span className="font-data-md font-bold text-text-primary">{bot.status}</span>
        </div>
        <div className="rounded border border-border-subtle bg-surface-variant p-2">
          <span className="font-label-caps text-label-caps text-text-muted block">CAPITAL</span>
          <span className="font-data-md font-bold text-text-primary">{bot.capitalAllocated} SOL</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle pt-2">
        <span className="font-label-caps text-label-caps font-bold text-profit-emerald">{isRunning ? 'ACTIVE' : 'IDLE'}</span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => onToggle(bot.id, isRunning ? 'stopped' : 'running')} className="font-label-caps text-label-caps font-semibold">
            {isRunning ? 'Pause' : 'Resume'}
          </Button>
          <Link href={`/arbitrage/${bot.id}`}>
            <Button size="sm" variant="outline" className="font-label-caps text-label-caps font-medium">Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RoutingParam({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border-subtle bg-surface-variant p-3">
      <span className="font-label-caps text-label-caps font-medium text-text-secondary">{label}</span>
      <div className="flex items-center justify-between">
        <input defaultValue={value} className="w-24 rounded border border-border-subtle bg-white px-2 py-0.5 font-data-md font-bold text-text-primary focus:border-primary focus:outline-none" />
        <span className="font-label-caps text-label-caps text-text-muted">{unit}</span>
      </div>
    </div>
  );
}

function OpportunityScanner({ opportunities }: { opportunities: Opportunity[] }) {
  const featured = opportunities[0];
  const rest = opportunities.slice(1, 4);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-subtle p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-2">
          <Icon name="radar" className="text-body-lg text-rose-600" />
          <h3 className="font-headline-sm font-bold text-text-primary">Opportunity Scanner</h3>
        </div>
        <span className="animate-pulse rounded border border-rose-200 bg-rose-50 px-2 py-0.5 font-label-caps text-label-caps font-bold text-rose-600">LIVE ARB TICKER</span>
      </div>

      {featured && (
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-lg border border-border-subtle bg-surface-variant p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded border border-sky-200 bg-sky-100 px-1.5 py-0.5 font-label-caps text-label-caps font-bold text-sky-800">TOP ALPHA ROUTE</span>
            <span className="font-data-sm font-bold text-profit-emerald">Spread: +38.4 bps</span>
          </div>
          <div className="flex items-center gap-1 py-1 font-label-caps text-label-caps text-text-primary">
            <span className="rounded border border-border-subtle bg-white px-1.5 py-0.5 font-bold text-sky-700 shadow-xs">SOL</span>
            <span className="text-text-muted">→</span>
            <span className="font-medium text-text-secondary">Raydium</span>
            <span className="text-text-muted">→</span>
            <span className="rounded border border-border-subtle bg-white px-1.5 py-0.5 font-bold shadow-xs">USDC</span>
            <span className="text-text-muted">→</span>
            <span className="font-medium text-text-secondary">Meteora</span>
            <span className="text-text-muted">→</span>
            <span className="rounded border border-border-subtle bg-white px-1.5 py-0.5 font-bold text-profit-emerald shadow-xs">SOL</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-sm">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-text-muted font-medium">EST. NET PROFIT</span>
              <span className="font-data-md font-bold text-profit-emerald">+{featured.estimatedProfit.toFixed(3)} SOL</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-text-muted font-medium">LIQUIDITY DEPTH</span>
              <span className="font-data-md font-bold text-text-primary">$45,000</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 border-border-subtle bg-white font-headline-sm text-sm font-medium text-text-primary hover:bg-slate-100">Simulate Run</Button>
            <Button className="flex-1 bg-primary font-headline-sm text-sm font-bold text-white hover:bg-primary/90">Execute Instantly</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-1">
        {rest.map((opp) => (
          <div key={opp.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-border-subtle bg-surface-variant p-2 shadow-xs transition-colors hover:border-slate-300 hover:bg-white">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-label-caps text-label-caps text-text-primary">
                <span className="font-bold text-sky-700">{opp.pair.split('/')[0]}</span>
                <span className="text-text-muted">→</span>
                <span className="font-semibold">{opp.pair.split('/')[1]}</span>
                <span className="text-text-muted">→</span>
                <span className="font-bold text-profit-emerald">SOL</span>
              </div>
              <span className="font-data-sm text-text-muted">Pool: {opp.dexes.slice(0, 2).join(', ')}</span>
            </div>
            <div className="text-right">
              <span className="font-data-md block font-bold text-profit-emerald">+{opp.estimatedProfit.toFixed(3)} SOL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecTerminal({ logs }: { logs: string[] }) {
  const defaultLogs = [
    '[INFO] Block #298412104 received via websocket.',
    '[SCAN] Checking Meteora tick array 49102... In-range.',
    '[MEMPOOL] Detected large swap in Raydium pool: 400 SOL -> USDC.',
  ];
  const display = logs.length > 0 ? logs.slice(0, 8) : defaultLogs;

  return (
    <div className="flex min-h-[220px] flex-col rounded-xl border border-border-subtle bg-surface-subtle p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-2">
          <Icon name="terminal" className="text-body-md text-profit-emerald" />
          <span className="font-headline-sm font-bold text-text-primary">Rust Core Exec Stream</span>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5">
          <span className="h-2 w-2 rounded-full bg-profit-emerald animate-ping"></span>
          <span className="font-label-caps text-label-caps font-bold text-profit-emerald">TAILING</span>
        </div>
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1 overflow-hidden rounded-lg border border-border-subtle bg-slate-50 p-3 font-data-sm text-data-sm text-slate-800 shadow-inner">
        {display.map((log, i) => (
          <div key={i} className="text-slate-700">
            <span className="text-slate-400">[{formatTime(new Date())}]</span>{' '}
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

function TradeHistoryTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Icon name="history_toggle_off" className="text-headline-sm text-sky-600" />
          <h2 className="font-headline-md font-bold text-text-primary">Historical Trade Executions</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border-subtle bg-slate-100 p-0.5">
            <button className="rounded bg-white px-2.5 py-1 font-label-caps text-label-caps font-bold text-sky-700 shadow-xs">All DEXes</button>
            <button className="rounded px-2.5 py-1 font-label-caps text-label-caps font-medium text-text-muted hover:text-text-primary">Raydium</button>
            <button className="rounded px-2.5 py-1 font-label-caps text-label-caps font-medium text-text-muted hover:text-text-primary">Meteora</button>
            <button className="rounded px-2.5 py-1 font-label-caps text-label-caps font-medium text-text-muted hover:text-text-primary">Orca</button>
          </div>
          <Button variant="outline" className="flex items-center gap-1 border-border-subtle bg-white font-label-caps text-label-caps font-semibold text-text-secondary hover:bg-slate-50">
            <Icon name="file_download" className="text-body-sm" /> CSV
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-border-subtle bg-slate-50 font-label-caps text-label-caps uppercase text-text-muted">
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-4 font-semibold">Route</th>
              <th className="py-2.5 px-4 font-semibold">DEX Path</th>
              <th className="py-2.5 px-4 font-semibold">Input Size</th>
              <th className="py-2.5 px-4 font-semibold">Net Profit</th>
              <th className="py-2.5 px-4 font-semibold">Gas</th>
              <th className="py-2.5 px-4 text-right font-semibold">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-data-sm text-data-sm">
            {trades.slice(0, 8).map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <span className="block font-semibold text-text-primary">{formatTime(trade.executedAt)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-headline-sm text-sm font-semibold text-text-primary">{trade.pair}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="rounded border border-border-subtle bg-slate-100 px-1.5 py-0.5 font-medium text-text-secondary">{trade.pair.split('/').join(' ⇾ ')}</span>
                </td>
                <td className="py-3 px-4 font-semibold text-text-primary">{trade.volume.toFixed(4)} SOL</td>
                <td className="py-3 px-4 font-bold text-profit-emerald">+{Number(trade.profit).toFixed(6)} SOL</td>
                <td className="py-3 px-4 font-medium text-warning-amber">{Number(trade.gasUsed).toLocaleString()} CU</td>
                <td className="py-3 px-4 text-right">
                  <a href="#" className="inline-flex items-center gap-1 font-label-caps text-label-caps font-bold text-sky-700 hover:underline">
                    <span>{trade.txSignature.slice(0, 4)}...{trade.txSignature.slice(-4)}</span>
                    <Icon name="open_in_new" className="text-body-sm" />
                  </a>
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center font-label-caps text-label-caps text-text-muted">No trades recorded yet. Start a bot to begin.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between font-label-caps text-label-caps text-text-muted">
        <span>Showing {Math.min(trades.length, 8)} of {trades.length} confirmed MEV cycles</span>
        <div className="flex items-center gap-1">
          <button className="rounded border border-border-subtle bg-slate-100 px-2.5 py-1 text-text-secondary hover:text-text-primary">Prev</button>
          <button className="rounded bg-primary px-2.5 py-1 font-bold text-white shadow-xs">1</button>
          <button className="rounded border border-border-subtle bg-slate-100 px-2.5 py-1 text-text-secondary hover:text-text-primary">Next</button>
        </div>
      </div>
    </div>
  );
}
