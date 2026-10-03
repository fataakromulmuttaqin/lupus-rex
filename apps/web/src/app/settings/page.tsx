'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';

export default function SettingsPage() {
  const [rpc, setRpc] = useState('https://api.devnet.solana.com');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
        <h1 className="font-headline-lg text-headline-lg font-bold text-text-primary">Settings &amp; RPC</h1>
        <p className="text-sm text-text-secondary">Manage RPC endpoints, notifications, and security preferences.</p>
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Icon name="dns" className="text-sky-600" />
          <h2 className="font-headline-sm font-bold text-text-primary">RPC Endpoints</h2>
        </div>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="font-label-caps text-label-caps text-text-secondary font-medium">Primary RPC</Label>
            <Input value={rpc} onChange={(e) => setRpc(e.target.value)} className="border-border-subtle bg-white" />
          </div>
          <Button className="bg-primary font-headline-sm text-sm font-semibold text-white hover:bg-primary/90">Save</Button>
        </div>
      </div>
    </div>
  );
}
