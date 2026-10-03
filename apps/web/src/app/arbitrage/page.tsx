'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Bot as BotType } from '@/lib/types';

export default function ArbitragePage() {
  const [bots, setBots] = useState<BotType[]>([]);

  const fetchBots = () => api.get('/bots').then((r) => setBots(r.data as BotType[])).catch(() => {});

  useEffect(() => {
    fetchBots();
  }, []);

  const toggle = async (id: string, status: 'running' | 'stopped') => {
    await api.post(`/bots/${id}/${status === 'running' ? 'start' : 'stop'}`);
    fetchBots();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Arbitrage Bots</h1>
        <Link href="/arbitrage/new">
          <Button>
            <Bot className="mr-2 h-4 w-4" /> Create Bot
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Bots</CardTitle>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bots yet. Create your first arbitrage bot.</p>
          ) : (
            <div className="space-y-3">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{bot.name}</p>
                    <p className="text-xs text-muted-foreground">{bot.type} • {bot.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={bot.status === 'running' ? 'default' : 'secondary'}>{bot.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => toggle(bot.id, bot.status === 'running' ? 'stopped' : 'running')}>
                      {bot.status === 'running' ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Link href={`/arbitrage/${bot.id}`}>
                      <Button size="sm" variant="secondary">Details</Button>
                    </Link>
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
