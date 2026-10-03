'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import { Bot } from '@/lib/types';

export default function ArbitragePage() {
  const [bots, setBots] = useState<Bot[]>([]);

  const fetchBots = () => api.get('/bots').then((r) => setBots(r.data as Bot[])).catch(() => {});

  useEffect(() => {
    fetchBots();
  }, []);

  const toggle = async (id: string, status: 'running' | 'stopped') => {
    await api.post(`/bots/${id}/${status === 'running' ? 'start' : 'stop'}`);
    fetchBots();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-text-primary">Arbitrage Bots</h1>
          <p className="text-sm text-text-secondary">Deploy, pause, and monitor multi-DEX arbitrage strategies.</p>
        </div>
        <Link href="/arbitrage/new">
          <Button className="flex items-center gap-1.5 bg-primary font-headline-sm text-sm font-semibold text-white hover:bg-primary/90">
            <Icon name="add_circle" className="text-lg" />
            Create Bot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => {
          const isRunning = bot.status === 'running';
          return (
            <div key={bot.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border-subtle bg-surface-subtle p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm font-bold text-text-primary">{bot.name}</span>
                    <span className={isRunning ? 'flex items-center gap-1 rounded border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 font-label-caps text-label-caps font-bold text-profit-emerald' : 'flex items-center gap-1 rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 font-label-caps text-label-caps font-bold text-amber-800'}>
                      <span className={isRunning ? 'h-1.5 w-1.5 rounded-full bg-profit-emerald' : 'h-1.5 w-1.5 rounded-full bg-amber-600'}></span>
                      {isRunning ? 'RUNNING' : 'STOPPED'}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary">{bot.type} • Capital: {bot.capitalAllocated} SOL</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-border-subtle bg-surface-variant p-2">
                  <span className="font-label-caps text-label-caps text-text-muted block">MIN PROFIT</span>
                  <span className="font-data-md font-bold text-text-primary">{bot.config?.minProfitLamports ? (Number(bot.config.minProfitLamports) / 1e9).toFixed(3) : '0.05'} SOL</span>
                </div>
                <div className="rounded border border-border-subtle bg-surface-variant p-2">
                  <span className="font-label-caps text-label-caps text-text-muted block">DEX</span>
                  <span className="font-data-md font-bold text-text-primary">{Array.isArray(bot.config?.dexes) ? bot.config.dexes.slice(0, 2).join(', ') : 'All'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                <Button size="sm" variant="outline" onClick={() => toggle(bot.id, isRunning ? 'stopped' : 'running')} className="font-label-caps text-label-caps font-semibold">
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Link href={`/arbitrage/${bot.id}`}>
                  <Button size="sm" variant="outline" className="font-label-caps text-label-caps font-medium">Details</Button>
                </Link>
              </div>
            </div>
          );
        })}
        {bots.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border-subtle bg-surface-subtle p-8 text-center text-text-muted">
            No bots yet. Create your first arbitrage bot.
          </div>
        )}
      </div>
    </div>
  );
}
