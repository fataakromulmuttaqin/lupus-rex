'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bot, TrendingUp, Wallet, AlertTriangle, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useWs } from '@/components/providers/ws-provider';
import { Bot as BotType, Opportunity, TradeExecutedEvent } from '@/lib/types';

export default function DashboardPage() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [liveTrades, setLiveTrades] = useState<TradeExecutedEvent[]>([]);
  const { socket } = useWs();

  useEffect(() => {
    api.get('/bots').then((r) => setBots(r.data as BotType[])).catch(() => {});
    api.get('/arbitrage/opportunities').then((r) => setOpportunities(r.data as Opportunity[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onTrade = (event: TradeExecutedEvent) => {
      setLiveTrades((prev) => [event, ...prev].slice(0, 20));
    };
    socket.on('trade.executed', onTrade);
    return () => {
      socket.off('trade.executed', onTrade);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/arbitrage/new">
          <Button>
            <Bot className="mr-2 h-4 w-4" /> New Arbitrage Bot
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Portfolio Value" value="$1,250.00" change="+5.2%" icon={Wallet} />
        <StatCard title="Realized PnL" value="+$42.50" change="24h" icon={TrendingUp} positive />
        <StatCard title="Active Bots" value={bots.length.toString()} subtitle="2 running" icon={Bot} />
        <StatCard title="Capital at Risk" value="12%" subtitle="within limits" icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <p className="text-sm text-muted-foreground">Chart placeholder — integrate Recharts here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveTrades.length === 0 && opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No live activity yet.</p>
            ) : (
              <>
                {liveTrades.slice(0, 10).map((trade, idx) => (
                  <div key={`${trade.txSignature}-${idx}`} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{trade.pair}</p>
                      <p className="text-xs text-muted-foreground">{new Date(trade.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <Badge variant="outline" className={trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(4)} SOL
                    </Badge>
                  </div>
                ))}
                {opportunities.slice(0, 5).map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between rounded-lg border p-3 opacity-70">
                    <div>
                      <p className="font-medium">{opp.pair}</p>
                      <p className="text-xs text-muted-foreground">{opp.dexes.join(', ')}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-400">+{opp.estimatedProfit} SOL</Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: LucideIcon;
  positive?: boolean;
}

function StatCard({ title, value, change, subtitle, icon: Icon, positive }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-400">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {change && (
          <p className={`mt-2 text-xs ${positive ? 'text-emerald-400' : 'text-muted-foreground'}`}>
            {positive && <ArrowUpRight className="mr-1 inline h-3 w-3" />}
            {change}
          </p>
        )}
        {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
