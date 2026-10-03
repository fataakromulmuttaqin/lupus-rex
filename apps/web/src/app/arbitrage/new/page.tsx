'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
        <h1 className="font-headline-lg text-headline-lg font-bold text-text-primary">Create Arbitrage Bot</h1>
        <p className="text-sm text-text-secondary">Configure min profit, capital allocation, and DEX targets.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="font-label-caps text-label-caps text-text-secondary font-medium">Bot Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SOL-USDC Main Arb" required className="border-border-subtle bg-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-label-caps text-label-caps text-text-secondary font-medium">Min Profit (SOL)</Label>
          <Input type="number" step="0.001" value={minProfit} onChange={(e) => setMinProfit(e.target.value)} required className="border-border-subtle bg-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-label-caps text-label-caps text-text-secondary font-medium">Capital Allocated (SOL)</Label>
          <Input type="number" step="0.1" value={capital} onChange={(e) => setCapital(e.target.value)} required className="border-border-subtle bg-white" />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading} className="bg-primary font-headline-sm text-sm font-semibold text-white hover:bg-primary/90">
            {loading ? 'Creating...' : 'Create Bot'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/arbitrage')} className="border-border-subtle bg-white font-headline-sm text-sm font-medium text-text-primary hover:bg-slate-50">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
