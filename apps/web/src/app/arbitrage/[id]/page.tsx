'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useWs } from '@/components/providers/ws-provider';
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

  if (!bot) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{bot.name}</h1>
        <Badge variant={bot.status === 'running' ? 'default' : 'secondary'}>{bot.status}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-zinc-900 p-4 text-xs text-zinc-300">
              {JSON.stringify(bot.config, null, 2)}
            </pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Realized PnL</p>
            <p className="text-2xl font-bold text-emerald-400">
              {trades.reduce((sum, t) => sum + t.profit, 0).toFixed(6)} SOL
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Capital allocated: {bot.capitalAllocated} SOL</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Log</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades yet. Start the bot to see live trades.</p>
          ) : (
            <div className="space-y-2">
              {trades.slice().reverse().map((trade) => (
                <div key={trade.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{trade.pair}</p>
                    <p className="text-xs text-muted-foreground">{trade.txSignature.slice(0, 16)}...</p>
                  </div>
                  <div className="text-right">
                    <p className={trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(6)} SOL
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(trade.executedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
