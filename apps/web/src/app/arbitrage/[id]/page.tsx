'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { api } from '@/lib/api';
import { useWs } from '@/components/providers/ws-provider';
import { Icon } from '@/components/ui/icon';
import { Bot, Trade, TradeExecutedEvent } from '@/lib/types';

export default function BotDetailPage() {
  const { id } = useParams() as { id: string };
  const [bot, setBot] = useState<Bot | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const { socket } = useWs();

  const fetchBot = useCallback(
    () =>
      api
        .get('/bots')
        .then((r) => {
          const found = (r.data as Bot[]).find((b) => b.id === id);
          setBot(found || null);
        })
        .catch(() => {}),
    [id],
  );

  const fetchTrades = useCallback(
    () =>
      api
        .get(`/bots/${id}/trades`)
        .then((r) => setTrades(r.data as Trade[]))
        .catch(() => {}),
    [id],
  );

  useEffect(() => {
    fetchBot();
    fetchTrades();
  }, [fetchBot, fetchTrades]);

  useEffect(() => {
    if (!socket) return;
    const onTrade = (event: TradeExecutedEvent) => {
      if (event.botId === id) {
        fetchTrades();
      }
    };
    socket.on('trade.executed', onTrade);
    return () => {
      socket.off('trade.executed', onTrade);
    };
  }, [socket, id, fetchTrades]);

  if (!bot) return <p className="text-sm text-text-muted">Loading...</p>;

  const pnl = trades.reduce((sum, t) => sum + Number(t.profit), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-sky-100 text-sky-700">
            <Icon name="sync_alt" className="text-headline-sm" />
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-text-primary">{bot.name}</h1>
            <p className="text-sm text-text-secondary">ID: #{bot.id.slice(0, 6)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={bot.status === 'running' ? 'rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 font-label-caps text-label-caps font-bold text-profit-emerald' : 'rounded border border-amber-200 bg-amber-100 px-2 py-0.5 font-label-caps text-label-caps font-bold text-amber-800'}>
            {bot.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
          <h3 className="font-headline-sm font-bold text-text-primary">Configuration</h3>
          <pre className="mt-3 overflow-auto rounded-lg border border-border-subtle bg-surface-variant p-3 text-xs text-text-secondary">
            {JSON.stringify(bot.config, null, 2)}
          </pre>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
          <h3 className="font-headline-sm font-bold text-text-primary">Performance</h3>
          <div className="mt-3">
            <p className="font-label-caps text-label-caps text-text-muted">Realized PnL</p>
            <p className="font-data-lg font-bold text-profit-emerald">{pnl.toFixed(6)} SOL</p>
          </div>
          <div className="mt-3">
            <p className="font-label-caps text-label-caps text-text-muted">Capital allocated</p>
            <p className="font-data-md font-bold text-text-primary">{bot.capitalAllocated} SOL</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
        <h3 className="font-headline-sm font-bold text-text-primary">Trade Log</h3>
        <div className="mt-3 w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-border-subtle bg-slate-50 font-label-caps text-label-caps uppercase text-text-muted">
                <th className="py-2.5 px-4 font-semibold">Time</th>
                <th className="py-2.5 px-4 font-semibold">Pair</th>
                <th className="py-2.5 px-4 font-semibold">Profit</th>
                <th className="py-2.5 px-4 font-semibold">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-data-sm text-data-sm">
              {trades.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center font-label-caps text-label-caps text-text-muted">No trades yet.</td>
                </tr>
              )}
              {trades.slice().reverse().map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">{new Date(trade.executedAt).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 font-semibold text-text-primary">{trade.pair}</td>
                  <td className="py-3 px-4 font-bold text-profit-emerald">+{Number(trade.profit).toFixed(6)} SOL</td>
                  <td className="py-3 px-4">{Number(trade.volume).toFixed(4)} SOL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
