'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function NewArbitrageBotPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [minProfit, setMinProfit] = useState('0.01');
  const [capital, setCapital] = useState('1');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.post('/bots', {
      name,
      type: 'arbitrage',
      config: { minProfitLamports: Number(minProfit) * 1e9, dexes: ['raydium', 'orca'] },
      capitalAllocated: Number(capital),
    });
    setLoading(false);
    router.push('/arbitrage');
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Create Arbitrage Bot</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Bot Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SOL-USDC Main Arb" required />
            </div>
            <div>
              <Label>Min Profit (SOL)</Label>
              <Input type="number" step="0.001" value={minProfit} onChange={(e) => setMinProfit(e.target.value)} required />
            </div>
            <div>
              <Label>Capital Allocated (SOL)</Label>
              <Input type="number" step="0.1" value={capital} onChange={(e) => setCapital(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Bot'}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/arbitrage')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
